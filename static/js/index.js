window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + "/" + String(i).padStart(6, "0") + ".jpg";
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function () {
    return false;
  };
  image.oncontextmenu = function () {
    return false;
  };
  $("#interpolation-image-wrapper").empty().append(image);
}

$(document).ready(function () {
  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  var options = {
    slidesToScroll: 1,
    slidesToShow: 3,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  };

  // Initialize all div with carousel class
  var carousels = bulmaCarousel.attach(".carousel", options);

  // Loop on each carousel initialized
  for (var i = 0; i < carousels.length; i++) {
    // Add listener to  event
    carousels[i].on("before:show", (state) => {
      console.log(state);
    });
  }

  // Access to bulmaCarousel instance of an element
  var element = document.querySelector("#my-element");
  if (element && element.bulmaCarousel) {
    // bulmaCarousel instance is available as element.bulmaCarousel
    element.bulmaCarousel.on("before-show", function (state) {
      console.log(state);
    });
  }

  /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
  preloadInterpolationImages();

  $("#interpolation-slider").on("input", function (event) {
    setInterpolationImage(this.value);
  });
  setInterpolationImage(0);
  $("#interpolation-slider").prop("max", NUM_INTERP_FRAMES - 1);

  bulmaSlider.attach();

  // Add collapsible functionality for findings
  $(".finding-header").on("click", function () {
    var content = $(this).next(".finding-content");
    content.slideToggle();
  });

  // Add hover functionality for findings
  $(".finding-container").on("mouseenter", function () {
    var content = $(this).find(".finding-content");
    content.slideDown();
  });

  $(".finding-container").on("mouseleave", function () {
    var content = $(this).find(".finding-content");
    content.slideUp();
  });
});

// Functions for Phase 2 comparison hover effects
function showDetails(elementId) {
  var element = document.getElementById(elementId);
  if (element) {
    element.style.display = "block";
  }
}

function hideDetails(elementId) {
  var element = document.getElementById(elementId);
  if (element) {
    element.style.display = "none";
  }
}

// Function for toggling finding content
function toggleFinding(elementId) {
  var element = document.getElementById(elementId);
  if (element) {
    if (element.style.display === "none" || element.style.display === "") {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  }
}

// Function for toggling reasoning log
function toggleReasoningLog(headerElement) {
  var content = headerElement.nextElementSibling;
  var icon = headerElement.querySelector(".reasoning-log-toggle-icon");

  if (content.style.display === "none" || content.style.display === "") {
    content.style.display = "block";
    icon.textContent = "▲";
    headerElement.classList.add("expanded");
  } else {
    content.style.display = "none";
    icon.textContent = "▼";
    headerElement.classList.remove("expanded");
  }
}

// Material viewer functionality
$(document).ready(function () {
  // Handle agent and task selection changes
  $("#agent-selector, #task-selector").on("change", function () {
    var agentType = $("#agent-selector").val();
    var taskType = $("#task-selector").val();

    if (agentType && taskType) {
      displayMaterials(agentType, taskType);
    } else {
      $("#material-display").hide();
    }
  });
});

function displayMaterials(agentType, taskType) {
  var materialDisplay = $("#material-display");
  var materialContent = $("#material-content");

  // Show the display area
  materialDisplay.show();

  // Clear previous content
  materialContent.empty();

  // Add loading indicator
  materialContent.html(
    '<div class="has-text-centered"><span class="icon is-large"><i class="fas fa-spinner fa-spin fa-2x"></i></span><br><p class="mt-2">Loading materials...</p></div>'
  );

  // Determine the base path and task directory based on agent type
  var taskDir = taskType;
  if (agentType === "Claude_CUA" || agentType === "Operator") {
    taskDir = taskType.replace("task_", "task"); // task_1 -> task1
  }
  var basePath = "./static/AgentResult/" + agentType + "/" + taskDir;

  // Build content based on agent type
  var content = '<div class="columns is-multiline"><div class="column is-12">';
  content +=
    '<h4 class="title is-5">Materials for ' +
    getAgentDisplayName(agentType) +
    " - " +
    getTaskDisplayName(taskType) +
    "</h4>";

  if (agentType === "Operator") {
    // Operator has MOV files
    content += '<div class="video-container video-container--large">';
    content += '<video controls class="material-video">';
    // MOV file is inside the task directory and named after the task (e.g., task1/task1.mov)
    content +=
      '<source src="' + basePath + "/" + taskDir + '.mov" type="video/mp4">';
    content += "Your browser does not support the video tag.";
    content += "</video>";
    content += "</div>";
    // Render steps without border
    content += '<div class="column is-12">';
    content += '<div id="log-render"></div>';
    content += "</div>";
    content += "</div>";
  } else if (agentType === "Claude_CUA") {
    // Claude CUA has PDF and TXT files with specific names
    content += '<div class="file-links">';
    content +=
      '<a href="' +
      basePath +
      '/Computer Use Demo.pdf" target="_blank" class="button is-primary is-medium mr-3">';
    content +=
      '<span class="icon"><i class="fas fa-file-pdf"></i></span><span>View PDF</span></a>';
    content += "</div>";
    // Directly render reasoning steps below
    // Render steps without border
    content += '<div class="column is-12">';
    content += '<div id="log-render"></div>';
    content += "</div>";
    content += "</div>";
  } else {
    // BrowserUse agents have GIF and JSON files
    content += '<div class="columns is-multiline">';
    content += '<div class="column is-12">';
    content += '<h5 class="title is-6">Agent History (GIF)</h5>';
    content += '<div class="gif-container-large">';
    content +=
      '<img class="material-gif-large" src="' +
      basePath +
      '/agent_history.gif" alt="Agent History" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">';
    content +=
      '<div style="display:none; padding: 2rem; text-align: center; background: #f5f5f5; border-radius: 8px;"><p>GIF file not found or failed to load</p></div>';
    content += "</div>";
    content += "</div>";
    content += '<div class="column is-12">';
    content += '<div id="log-render"></div>';
    content += "</div>";
    content += "</div>";
    // Render JSON steps directly
    console.log(basePath);
  }

  content += "</div></div>";

  // Update content
  materialContent.html(content);

  // Now that #log-render exists in the DOM, render the JSON steps
  renderJsonSteps(basePath);
}

function getAgentDisplayName(agentType) {
  var names = {
    BrowserUse_Claude: "BrowserUse + Claude 3.7",
    BrowserUse_Deepseek: "BrowserUse + DeepSeek V3",
    BrowserUse_Gemini: "BrowserUse + Gemini 2.0",
    BrowserUse_GPT4o: "BrowserUse + GPT-4o",
    Claude_CUA: "Claude CUA",
    Operator: "Operator",
  };
  return names[agentType] || agentType;
}

function getTaskDisplayName(taskType) {
  var taskNum = taskType.replace("task_", "");
  var names = [
    "Adding Steps",
    "Bait and Switch",
    "Hiding Information",
    "Manipulating Visual Choice Architecture",
    "Bad Defaults",
    "Emotional or Sensory Manipulation",
    "Trick Questions",
    "Choice Overload",
    "Social Proof",
    "Nagging",
    "Forced Communication or Disclosure",
    "Scarcity and Popularity Claims",
    "Forced Registration",
    "Hidden Information",
    "Urgency",
    "Shaming",
  ];
  return "Task " + taskNum + ": " + names[parseInt(taskNum) - 1];
}

// Render JSON steps inline// Render JSON steps inline
function renderJsonSteps(basePath) {
  var container = $("#log-render");
  if (!container.length) {
    return;
  }
  container.html('<p class="has-text-grey">Loading log steps...</p>');

  // Try reasoning.json first (most common), then fallback patterns
  var url = basePath + "/reasoning.json";
  console.log(url);
  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("not_ok");
      }
      return response.text();
    })
    .then(function (text) {
      if (!text || text.trim().length === 0) {
        container.html(
          '<p class="has-text-grey">No reasoning log available.</p>'
        );
        return;
      }
      var data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        // Fallback: show raw text
        container.html(
          '<pre style="white-space: pre-wrap; word-break: break-word;">' +
            $("<div/>").text(text).html() +
            "</pre>"
        );
        return;
      }

      // Normalize to an array of step strings
      var steps = [];
      if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
          var item = data[i];
          if (item && typeof item === "object") {
            if (typeof item.thinking === "string") {
              steps.push(item.thinking);
            } else if (typeof item.message === "string") {
              steps.push(item.message);
            } else {
              steps.push(JSON.stringify(item));
            }
          } else if (typeof item === "string") {
            steps.push(item);
          }
        }
      } else if (data && typeof data === "object") {
        // If object, list key-value pairs
        Object.keys(data).forEach(function (key) {
          var value = data[key];
          if (typeof value === "string") {
            steps.push(key + ": " + value);
          } else {
            steps.push(key + ": " + JSON.stringify(value));
          }
        });
      } else if (typeof data === "string") {
        steps = data.split(/\n+/);
      }

      if (!steps.length) {
        container.html(
          '<p class="has-text-grey">No reasoning steps found in file.</p>'
        );
        return;
      }

      // MODIFICATION START: Replaced the <ol> list with a more readable format.
      var html = "";
      html += '<div class="reasoning-log-container">';
      html +=
        '<div class="reasoning-log-header" onclick="toggleReasoningLog(this)">';
      html +=
        '<span class="reasoning-log-title">Reasoning Log (' +
        steps.length +
        " steps)</span>";
      html += '<span class="reasoning-log-toggle-icon">▼</span>';
      html += "</div>";
      // Added padding for better spacing when expanded
      html +=
        '<div class="reasoning-log-content" style="display: none; padding-top: 1rem;">';
      for (var s = 0; s < steps.length; s++) {
        var safeStep = $("<div/>").text(steps[s]).html();
        // Each step is in its own div for clear separation.
        html += '<div class="log-step" style="margin-bottom: 1em;">';
        // Added a bold "Step X" header for each entry.
        html +=
          '<p style="font-weight: bold; margin-bottom: 0.25em;">Step ' +
          (s + 1) +
          "</p>";
        // Ensured content wraps correctly without any hanging indents.
        // 'pre-wrap' preserves newlines from the original text.
        html +=
          '<div class="step-content" style="white-space: pre-wrap; word-break: break-word;">' +
          safeStep +
          "</div>";
        html += "</div>";
      }
      html += "</div>"; // End reasoning-log-content
      html += "</div>"; // End reasoning-log-container
      container.html(html);
      // MODIFICATION END
    })
    .catch(function () {
      container.html(
        '<p class="has-text-grey">No reasoning log found at ' +
          $("<div/>").text(url).html() +
          "</p>"
      );
    });
}
