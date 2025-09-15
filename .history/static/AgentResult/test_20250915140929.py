import os
import json
import glob


def find_thinkings_recursively(data, thoughts_list):
    """
    递归地在嵌套的字典或列表中查找 'thinking' 字段，并将其值添加到列表中。

    Args:
        data (dict or list): 要搜索的JSON数据。
        thoughts_list (list): 用于存储结果的列表。
    """
    if isinstance(data, dict):
        for key, value in data.items():
            if key == "thinking" and isinstance(value, str) and value:
                # 找到了 'thinking' 字段，并且它的值是一个非空字符串
                thoughts_list.append({"thinking": value})
            elif isinstance(value, (dict, list)):
                # 继续在嵌套的字典或列表中搜索
                find_thinkings_recursively(value, thoughts_list)
    elif isinstance(data, list):
        for item in data:
            # 如果是列表，则遍历列表中的每个元素
            find_thinkings_recursively(item, thoughts_list)


def process_run_json_files(root_dir="AgentResult"):
    """
    主函数，用于遍历、处理和转换JSON日志文件。

    Args:
        root_dir (str): 包含所有日志文件的根文件夹的名称。
    """
    if not os.path.isdir(root_dir):
        print(
            f"错误：找不到目录 '{root_dir}'。请确保脚本与 '{root_dir}' 文件夹在同一目录下。"
        )
        return

    # 构建一个匹配模式，以查找所有符合条件的 run_*.json 文件
    # 模式: AgentResult/BrowserUse_*/task_*/run_*.json
    search_pattern = os.path.join(root_dir, "BrowserUse_*", "task_*", "run_*.json")

    # 使用 glob 查找所有匹配的文件路径
    json_files = glob.glob(search_pattern)

    if not json_files:
        print("未找到任何匹配的 'run_*.json' 文件。")
        return

    print(f"找到了 {len(json_files)} 个文件进行处理...")

    for file_path in json_files:
        print(f"\n正在处理文件: {file_path}")
        thinking_data = []

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                # 尝试将其作为单个完整的JSON对象加载
                try:
                    data = json.load(f)
                    find_thinkings_recursively(data, thinking_data)
                except json.JSONDecodeError:
                    # 如果失败，则可能是JSONL格式（每行一个JSON对象）
                    print("  - 文件不是标准JSON，尝试按行解析 (JSONL)...")
                    f.seek(0)  # 重置文件指针到开头
                    for line in f:
                        line = line.strip()
                        if line:
                            try:
                                line_data = json.loads(line)
                                find_thinkings_recursively(line_data, thinking_data)
                            except json.JSONDecodeError:
                                print(f"  - 警告: 无法解析该行: {line[:100]}...")
        except Exception as e:
            print(f"  - 读取文件时出错: {e}")
            continue  # 跳过这个文件

        if not thinking_data:
            print("  - 未在此文件中找到 'thinking' 数据。")
            # 即使没有找到thinking数据，也删除原文件，以防重复处理
            try:
                os.remove(file_path)
                print(f"  - 已删除空的原始文件: {os.path.basename(file_path)}")
            except OSError as e:
                print(f"  - 删除文件时出错: {e}")
            continue

        # 获取文件的目录路径
        dir_path = os.path.dirname(file_path)
        # 定义输出文件的路径
        output_path = os.path.join(dir_path, "reasoning.json")

        try:
            # 将提取的数据写入 reasoning.json
            with open(output_path, "w", encoding="utf-8") as f:
                # ensure_ascii=False 支持中文等非ASCII字符
                # indent=2 使JSON文件格式优美，易于阅读
                json.dump(thinking_data, f, ensure_ascii=False, indent=2)
            print(f"  - 成功创建: {output_path}")

            # 成功写入新文件后，删除原始文件
            try:
                os.remove(file_path)
                print(f"  - 成功删除原始文件: {os.path.basename(file_path)}")
            except OSError as e:
                print(f"  - 删除原始文件时出错: {e}")

        except Exception as e:
            print(f"  - 写入新文件时出错: {e}")

    print("\n所有任务处理完毕！")


if __name__ == "__main__":
    # 假设脚本和 AgentResult 文件夹在同一个目录中
    process_run_json_files("AgentResult")
