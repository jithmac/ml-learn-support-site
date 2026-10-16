/* =========================================================
   SITE-WIDE GLOSSARY & TOOLTIP ENGINE
   Automatically detects target data science terminology
   across all lessons and displays rich interactive tooltips
   on hover and keyboard focus.
   ========================================================= */
(function (global) {
  "use strict";

  // Term dictionary with educational definitions & real-world examples
  var GLOSSARY_TERMS = {
    // --- 1. Foundational Data Types ---
    discrete: {
      term: "Discrete Data",
      badge: "Countable",
      badgeType: "teal",
      definition: "Values that are distinct, separate, and countable in whole numbers (integers). They cannot be subdivided into fractional parts.",
      example: "Number of students (24), website clicks, or dice rolls. You cannot have 2.5 students."
    },
    categorical: {
      term: "Categorical Data",
      badge: "Labels & Groups",
      badgeType: "coral",
      definition: "Qualitative data representing distinct categories, names, or classes rather than measurable numbers. Can be nominal (unordered) or ordinal (ordered).",
      example: 'Country ("France"), blood type ("O+"), or target classification ("Pass" vs "Fail").'
    },
    continuous: {
      term: "Continuous Data",
      badge: "Continuum",
      badgeType: "teal",
      definition: "Numerical measurements that can take any real value along an unbroken continuum with infinite possible decimal subdivisions.",
      example: "Salary ($63,777.78), temperature (24.6°C), height (1.75 m), or elapsed time."
    },
    numerical: {
      term: "Numerical Data",
      badge: "Quantitative",
      badgeType: "gold",
      definition: "Quantitative values expressed as real numbers measuring magnitude, scale, or counts, upon which arithmetic operations (sums, averages, scaling) are valid.",
      example: "Encompasses both Discrete (countable integers) and Continuous (measured decimals) data."
    },
    qualitative: {
      term: "Qualitative Data",
      badge: "Descriptive",
      badgeType: "coral",
      definition: "Non-numerical descriptive information representing qualities, attributes, or categories rather than mathematical measurements.",
      example: 'Customer feedback sentiments ("Satisfied"), colors, survey ratings, or animal species.'
    },
    quantitative: {
      term: "Quantitative Data",
      badge: "Measurable",
      badgeType: "teal",
      definition: "Objective data that can be counted or measured numerically, answering questions of 'how many' or 'how much'.",
      example: "Transaction counts, revenue figures, test scores, or physical measurements."
    },

    // --- 2. Categorical Subtypes ---
    nominal: {
      term: "Nominal Data",
      badge: "Unordered Category",
      badgeType: "coral",
      definition: "A qualitative categorical variable with distinct names or labels that have no natural ranking, order, or quantitative difference.",
      example: 'Country ("France", "Spain"), eye color, blood type ("A", "B", "O"), or gender.'
    },
    ordinal: {
      term: "Ordinal Data",
      badge: "Ordered Category",
      badgeType: "coral",
      definition: "A qualitative categorical variable where values possess a clear, meaningful natural order or ranking, though the mathematical intervals between ranks are not equal.",
      example: "Customer satisfaction (Low, Medium, High), star ratings (1 to 5), or education levels (High School, BSc, PhD)."
    },

    // --- 3. Supervised Learning Tasks ---
    classification: {
      term: "Classification",
      badge: "Predicting Classes",
      badgeType: "teal",
      definition: "A core supervised learning task where the model learns a decision boundary to assign input data points into discrete categories or classes.",
      example: "Spam detection (Spam vs Not Spam), medical diagnosis (Disease vs Healthy), or image recognition."
    },
    regression: {
      term: "Regression",
      badge: "Predicting Numbers",
      badgeType: "teal",
      definition: "A core supervised learning task where the model fits a mathematical trend curve to predict continuous, infinite real numerical values.",
      example: "Predicting house prices ($350,000), tomorrow's temperature (28.4°C), or employee salary."
    },

    // --- 4. Dataset Components ---
    feature: {
      term: "Feature (X)",
      badge: "Input Variable",
      badgeType: "gold",
      definition: "An individual measurable property, characteristic, or column of data fed into a machine learning model to make predictions.",
      example: "In house price prediction: square footage, number of bedrooms, and neighborhood zip code."
    },
    target: {
      term: "Target Variable (y)",
      badge: "Model Objective",
      badgeType: "coral",
      definition: "The specific dependent variable (y) that the machine learning algorithm is tasked with learning to predict from the input features.",
      example: "In loan approval: whether the customer defaults on payments ('Yes' or 'No')."
    },
    label: {
      term: "Label / Tag",
      badge: "Ground Truth",
      badgeType: "coral",
      definition: "A descriptive category name, attribute tag, or ground-truth outcome (y) assigned to identify and classify an observation in a dataset.",
      example: "The tag on an image ('Cat' vs 'Dog') or category tags like Country or Gender."
    },
    dataset: {
      term: "Dataset",
      badge: "Structured Data",
      badgeType: "teal",
      definition: "A structured collection of data organized into rows (individual observations/samples) and columns (features and targets).",
      example: "A CSV table or database with 1,000 customer records across 12 informational columns."
    },

    // --- 5. Learning Paradigms ---
    supervised: {
      term: "Supervised Learning",
      badge: "Learning with Labels",
      badgeType: "teal",
      definition: "A machine learning paradigm where the algorithm trains on paired examples of input features alongside known, correct ground-truth target labels.",
      example: "Training on historical patient medical metrics paired with their actual diagnosed conditions."
    },
    unsupervised: {
      term: "Unsupervised Learning",
      badge: "Pattern Discovery",
      badgeType: "gold",
      definition: "A machine learning paradigm where algorithms analyze unlabeled datasets to uncover hidden patterns, groupings, or clusters without predefined target answers.",
      example: "Customer segmentation: grouping shoppers into persona clusters based solely on browsing patterns."
    },
    clustering: {
      term: "Clustering",
      badge: "Grouping",
      badgeType: "teal",
      definition: "An unsupervised technique of grouping data points so that points in the same cluster are more similar to each other than to those in other clusters.",
      example: "Customer segmentation into distinct spending habit tiers."
    },
    dendrogram: {
      term: "Dendrogram",
      badge: "Hierarchy Tree",
      badgeType: "coral",
      definition: "A tree diagram that visualizes the sequence of merges or splits in hierarchical clustering, where vertical height represents dissimilarity.",
      example: "Cutting a customer dendrogram horizontally at height h = 5 to yield 3 clean market segments."
    },

    // --- 6. Quality, Scaling & Diagnostics ---
    outlier: {
      term: "Outlier",
      badge: "Extreme Anomaly",
      badgeType: "coral",
      definition: "An anomalous observation point that lies an abnormal distance away from the rest of the values in a dataset, which can distort statistical models.",
      example: "In an income survey averaging $50,000, a single billionaire salary ($1,000,000,000) heavily skews the mean."
    },
    overfitting: {
      term: "Overfitting",
      badge: "Model Flaw",
      badgeType: "coral",
      definition: "When a model learns the training data and random noise too strictly, memorizing training samples so rigidly that it fails to generalize to new, unseen data.",
      example: "A student memorizing exact practice test question letters rather than learning the underlying mathematical principles."
    },
    correlation: {
      term: "Correlation",
      badge: "Linear Relationship",
      badgeType: "teal",
      definition: "A statistical metric (from -1.0 to +1.0) measuring the strength and direction of a linear association between two numerical variables.",
      example: "Study hours and exam marks show positive correlation (+0.85); car speed and commute time show negative correlation (-0.72)."
    },
    standardization: {
      term: "Standardization (Z-Score)",
      badge: "Feature Scaling",
      badgeType: "gold",
      definition: "Rescaling numerical feature values so that the resulting distribution has a mean (μ) of 0 and a standard deviation (σ) of 1.",
      example: "Bringing wildly different features (e.g. salary in $10,000s and age in 10s) onto an identical zero-centered scale."
    },
    normalization: {
      term: "Normalization (Min-Max)",
      badge: "Feature Scaling",
      badgeType: "gold",
      definition: "Rescaling numerical feature values into a fixed bounded range, typically between 0.0 and 1.0, preserving proportional relationships.",
      example: "Scaling image pixel brightness values (0 to 255) into the standard decimal range [0.0, 1.0]."
    },
    median: {
      term: "Median",
      badge: "Robust Midpoint",
      badgeType: "teal",
      definition: "The exact middle numerical value separating the higher half from the lower half of an ordered dataset; unlike the mean, it is resistant to extreme outliers.",
      example: "In salaries [$30k, $40k, $50k, $10M], the median is $40k, while the arithmetic mean is skewed to $2.53M."
    },
    variance: {
      term: "Variance",
      badge: "Data Spread",
      badgeType: "gold",
      definition: "A statistical measure of how widely spread or dispersed numbers are around their average mean value; calculated as the average squared deviation (σ²).",
      example: "A low-variance dataset clusters tightly around the mean; a high-variance dataset has values widely scattered."
    },
    degrees_of_freedom: {
      term: "Degrees of Freedom (df)",
      badge: "Statistical Concept",
      badgeType: "teal",
      definition: "How many values can vary independently before the remaining values become determined.",
      example: "In simple linear regression, Error has n - 2 degrees of freedom because calculating β₀ and β₁ determines 2 values."
    }
  };

  // Aliases mapping (including requested spellings / common typos)
  var TERM_ALIASES = {
    // degrees of freedom
    "degrees of freedom": "degrees_of_freedom",
    "degree of freedom": "degrees_of_freedom",

    // discrete & typos/plurals
    discrete: "discrete",
    descrete: "discrete",
    discretes: "discrete",

    // categorical & typos/plurals
    categorical: "categorical",
    categoical: "categorical",
    categoricals: "categorical",

    // continuous & typos
    continuous: "continuous",
    continous: "continuous",

    // numerical & variations
    numerical: "numerical",
    numeric: "numerical",
    numericals: "numerical",

    // qualitative
    qualitative: "qualitative",

    // quantitative
    quantitative: "quantitative",

    // nominal
    nominal: "nominal",
    nominals: "nominal",

    // ordinal
    ordinal: "ordinal",
    ordinals: "ordinal",

    // classification & classifier
    classification: "classification",
    classifications: "classification",
    classifier: "classification",
    classifiers: "classification",

    // regression & regressor
    regression: "regression",
    regressions: "regression",
    regressor: "regression",
    regressors: "regression",

    // feature / features
    feature: "feature",
    features: "feature",

    // target / targets
    target: "target",
    targets: "target",

    // label / labels
    label: "label",
    labels: "label",

    // dataset / datasets
    dataset: "dataset",
    datasets: "dataset",

    // supervised
    supervised: "supervised",

    // unsupervised
    unsupervised: "unsupervised",

    // clustering
    clustering: "clustering",
    cluster: "clustering",
    clusters: "clustering",

    // dendrogram
    dendrogram: "dendrogram",
    dendrograms: "dendrogram",

    // outlier / outliers
    outlier: "outlier",
    outliers: "outlier",

    // overfitting
    overfitting: "overfitting",
    overfit: "overfitting",

    // correlation / correlations
    correlation: "correlation",
    correlations: "correlation",

    // standardization
    standardization: "standardization",

    // normalization
    normalization: "normalization",

    // median / medians
    median: "median",
    medians: "median",

    // variance / variances
    variance: "variance",
    variances: "variance"
  };

  var regexPattern = null;

  function buildRegex() {
    var keys = Object.keys(TERM_ALIASES).sort(function (a, b) {
      return b.length - a.length;
    });
    regexPattern = new RegExp("\\b(" + keys.join("|") + ")\\b", "gi");
  }
  buildRegex();

  var IGNORED_TAGS = {
    SCRIPT: true,
    STYLE: true,
    NOSCRIPT: true,
    TEMPLATE: true,
    TEXTAREA: true,
    INPUT: true,
    SELECT: true,
    OPTION: true,
    BUTTON: true,
    A: true,
    CODE: true,
    PRE: true,
    KBD: true,
    SAMP: true,
    SVG: true,
    H1: true,
    H2: true,
    H3: true,
    H4: true,
    H5: true,
    H6: true,
    HEADER: true,
    CAPTION: true,
    LEGEND: true
  };

  function isIgnoredParent(node) {
    var parent = node.parentElement;
    if (!parent) return true;
    if (IGNORED_TAGS[parent.tagName]) return true;
    if (
      parent.closest(
        "a, button, code, pre, kbd, samp, svg, script, style, h1, h2, h3, h4, h5, h6, header, [role='heading'], [class*='title'], [class*='heading'], [class*='header'], .tax-card-wide__name, .glossary-term, .no-glossary, [data-no-glossary], .tax-interactive-lab, .sl-sim-playground, .pflow-wire, .pflow-node"
      )
    ) {
      return true;
    }
    return false;
  }

  function replaceTextNode(textNode) {
    var parent = textNode.parentNode;
    if (!parent) return;

    var text = textNode.nodeValue;
    regexPattern.lastIndex = 0;

    var fragment = document.createDocumentFragment();
    var lastIndex = 0;
    var match;

    while ((match = regexPattern.exec(text)) !== null) {
      var matchIndex = match.index;
      var matchedWord = match[0];
      var matchedKey = matchedWord.toLowerCase();
      var canonicalKey = TERM_ALIASES[matchedKey];
      var termData = GLOSSARY_TERMS[canonicalKey];

      if (!termData) continue;

      if (matchIndex > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, matchIndex)));
      }

      var span = document.createElement("span");
      span.className = "glossary-term";
      span.setAttribute("data-glossary-key", canonicalKey);
      span.setAttribute("tabindex", "0");
      span.setAttribute("role", "button");
      span.setAttribute("aria-haspopup", "dialog");
      span.setAttribute("aria-label", matchedWord + ": view definition");
      span.textContent = matchedWord;

      fragment.appendChild(span);
      lastIndex = matchIndex + matchedWord.length;
    }

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    if (lastIndex > 0) {
      parent.replaceChild(fragment, textNode);
    }
  }

  function scanDOM(root) {
    if (!root) {
      root = document.querySelector("main.lesson") || document.querySelector("main") || document.body;
    }
    if (!root) return;

    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (!node || !node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_SKIP;
          }
          if (isIgnoredParent(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          regexPattern.lastIndex = 0;
          if (regexPattern.test(node.nodeValue)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    var candidateNodes = [];
    var current;
    while ((current = walker.nextNode())) {
      candidateNodes.push(current);
    }

    candidateNodes.forEach(function (node) {
      replaceTextNode(node);
    });
  }

  // Floating Singleton Tooltip UI
  var tooltipEl = null;
  var titleEl = null;
  var badgeEl = null;
  var descEl = null;
  var exampleEl = null;
  var arrowEl = null;
  var currentTarget = null;
  var hideTimeout = null;
  var showTimeout = null;

  function ensureTooltipElement() {
    if (tooltipEl && document.body.contains(tooltipEl)) return;

    var existing = document.getElementById("siteGlossaryTooltip");
    if (existing) {
      tooltipEl = existing;
    } else {
      tooltipEl = document.createElement("div");
      tooltipEl.id = "siteGlossaryTooltip";
      tooltipEl.className = "glossary-tooltip";
      tooltipEl.setAttribute("role", "tooltip");
      tooltipEl.setAttribute("aria-hidden", "true");

      tooltipEl.innerHTML =
        '<div class="glossary-tooltip__arrow" aria-hidden="true"></div>' +
        '<div class="glossary-tooltip__header">' +
          '<span class="glossary-tooltip__title"></span>' +
          '<span class="glossary-tooltip__badge"></span>' +
        '</div>' +
        '<div class="glossary-tooltip__desc"></div>' +
        '<div class="glossary-tooltip__example">' +
          '<svg class="glossary-tooltip__example-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"></circle>' +
            '<line x1="12" y1="16" x2="12" y2="12"></line>' +
            '<line x1="12" y1="8" x2="12.01" y2="8"></line>' +
          '</svg>' +
          '<span class="glossary-tooltip__example-text"></span>' +
        '</div>';

      document.body.appendChild(tooltipEl);
    }

    titleEl = tooltipEl.querySelector(".glossary-tooltip__title");
    badgeEl = tooltipEl.querySelector(".glossary-tooltip__badge");
    descEl = tooltipEl.querySelector(".glossary-tooltip__desc");
    exampleEl = tooltipEl.querySelector(".glossary-tooltip__example-text");
    arrowEl = tooltipEl.querySelector(".glossary-tooltip__arrow");

    tooltipEl.addEventListener("mouseenter", function () {
      clearTimeout(hideTimeout);
    });

    tooltipEl.addEventListener("mouseleave", function () {
      scheduleHide();
    });
  }

  function positionTooltip(targetEl) {
    if (!tooltipEl || !targetEl) return;

    var rect = targetEl.getBoundingClientRect();
    var tipWidth = tooltipEl.offsetWidth;
    var tipHeight = tooltipEl.offsetHeight;

    var gap = 9;
    var targetCenterX = rect.left + rect.width / 2;

    // Decide vertical position (default above, flip below if not enough room)
    var placeAbove = rect.top - tipHeight - gap > 10;
    var top;

    if (placeAbove) {
      top = rect.top - tipHeight - gap;
      tooltipEl.classList.add("is-top");
      tooltipEl.classList.remove("is-bottom");
    } else {
      top = rect.bottom + gap;
      tooltipEl.classList.add("is-bottom");
      tooltipEl.classList.remove("is-top");
    }

    // Horizontal placement centered on target
    var left = targetCenterX - tipWidth / 2;
    var margin = 12;
    var maxLeft = window.innerWidth - tipWidth - margin;

    if (left < margin) left = margin;
    if (left > maxLeft) left = maxLeft;

    // Arrow positioning
    var arrowX = targetCenterX - left;
    var minArrow = 16;
    var maxArrow = tipWidth - 16;
    if (arrowX < minArrow) arrowX = minArrow;
    if (arrowX > maxArrow) arrowX = maxArrow;

    if (arrowEl) {
      arrowEl.style.left = Math.round(arrowX) + "px";
    }

    tooltipEl.style.top = Math.round(top) + "px";
    tooltipEl.style.left = Math.round(left) + "px";
  }

  function showTooltip(targetEl) {
    clearTimeout(hideTimeout);
    clearTimeout(showTimeout);

    ensureTooltipElement();

    var key = targetEl.getAttribute("data-glossary-key");
    var data = GLOSSARY_TERMS[key];
    if (!data) return;

    if (currentTarget && currentTarget !== targetEl) {
      currentTarget.classList.remove("is-active");
    }
    currentTarget = targetEl;
    currentTarget.classList.add("is-active");

    titleEl.textContent = data.term;
    badgeEl.textContent = data.badge;
    badgeEl.className = "glossary-tooltip__badge glossary-tooltip__badge--" + (data.badgeType || "teal");
    descEl.textContent = data.definition;
    exampleEl.innerHTML = "<strong>e.g.</strong> " + data.example;

    tooltipEl.classList.add("is-measuring");
    tooltipEl.style.display = "block";

    positionTooltip(targetEl);

    tooltipEl.classList.remove("is-measuring");
    tooltipEl.classList.add("is-visible");
    tooltipEl.setAttribute("aria-hidden", "false");
  }

  function hideTooltip() {
    clearTimeout(hideTimeout);
    clearTimeout(showTimeout);
    if (!tooltipEl) return;

    tooltipEl.classList.remove("is-visible");
    tooltipEl.setAttribute("aria-hidden", "true");

    if (currentTarget) {
      currentTarget.classList.remove("is-active");
      currentTarget = null;
    }
  }

  function scheduleHide() {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideTooltip, 160);
  }

  function attachEvents() {
    // Hover via event delegation
    document.addEventListener("mouseover", function (e) {
      var term = e.target.closest(".glossary-term");
      if (term) {
        clearTimeout(hideTimeout);
        showTimeout = setTimeout(function () {
          showTooltip(term);
        }, 40);
      }
    });

    document.addEventListener("mouseout", function (e) {
      var term = e.target.closest(".glossary-term");
      if (term) {
        clearTimeout(showTimeout);
        scheduleHide();
      }
    });

    // Keyboard accessibility
    document.addEventListener("focusin", function (e) {
      var term = e.target.closest(".glossary-term");
      if (term) {
        showTooltip(term);
      }
    });

    document.addEventListener("focusout", function (e) {
      var term = e.target.closest(".glossary-term");
      if (term) {
        hideTooltip();
      }
    });

    // Mobile / Touch click
    document.addEventListener("click", function (e) {
      var term = e.target.closest(".glossary-term");
      if (term) {
        if (currentTarget === term && tooltipEl && tooltipEl.classList.contains("is-visible")) {
          hideTooltip();
        } else {
          showTooltip(term);
        }
      } else if (tooltipEl && !tooltipEl.contains(e.target)) {
        hideTooltip();
      }
    });

    // Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        hideTooltip();
      }
    });

    // Viewport changes
    window.addEventListener("scroll", function () {
      if (currentTarget && tooltipEl && tooltipEl.classList.contains("is-visible")) {
        positionTooltip(currentTarget);
      }
    }, { passive: true });

    window.addEventListener("resize", function () {
      if (currentTarget && tooltipEl && tooltipEl.classList.contains("is-visible")) {
        positionTooltip(currentTarget);
      }
    });
  }

  var initialized = false;
  function init() {
    if (initialized || global.SiteGlossaryInitialized) return;
    initialized = true;
    global.SiteGlossaryInitialized = true;
    ensureTooltipElement();
    scanDOM();
    attachEvents();
  }

  // Public API
  var SiteGlossary = {
    terms: GLOSSARY_TERMS,
    aliases: TERM_ALIASES,
    init: init,
    scan: scanDOM,
    show: showTooltip,
    hide: hideTooltip,
    addTerm: function (key, data, aliases) {
      GLOSSARY_TERMS[key] = data;
      TERM_ALIASES[key] = key;
      if (Array.isArray(aliases)) {
        aliases.forEach(function (alias) {
          TERM_ALIASES[alias.toLowerCase()] = key;
        });
      }
      buildRegex();
      scanDOM();
    }
  };

  global.SiteGlossary = SiteGlossary;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
