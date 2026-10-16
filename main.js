(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- reading progress (rAF-throttled, not a raw scroll listener) ---------- */
  var fill = document.getElementById("progressFill");
  var ticking = false;
  function updateProgress() {
    if (!fill) return;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
    fill.style.width = pct.toFixed(1) + "%";
    ticking = false;
  }
  if (fill) {
    document.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* ---------- estimated read time ---------- */
  var lessonEl = document.querySelector(".lesson");
  if (lessonEl) {
    var wordCount = lessonEl.innerText.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.round(wordCount / 200));
    var readTimeEl = document.getElementById("readTime");
    if (readTimeEl) readTimeEl.textContent = "~" + minutes + " min read";
  }

  /* ---------- mobile & desktop course nav ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("courseNav");
  var overlay = document.getElementById("navOverlay");
  var closeBtn = document.getElementById("navClose");

  function toggleNav(force) {
    var open = typeof force === 'boolean' ? force : !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    if(overlay) overlay.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", toggleNav);
    if (closeBtn) closeBtn.addEventListener("click", function() { toggleNav(false); });
    
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      toggleNav(false);
    });
  }

  /* ---------- pause the diagram's continuous animations when it's offscreen ----------
     these loops (the engine pulse, the traveling flow-dots) carry real meaning —
     they show data moving through the system — so they stay, but a nonessential
     loop should not keep running when nobody can see it. */
  var paradigmGrid = document.getElementById("paradigmGrid");
  if (paradigmGrid && "IntersectionObserver" in window) {
    var svgEls = paradigmGrid.querySelectorAll("svg.pdiag");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, { threshold: 0.2 });
    io.observe(paradigmGrid);

    if (!reduceMotion) {
      svgEls.forEach(function (svg) {
        var svgIo = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            try {
              if (entry.isIntersecting) { svg.unpauseAnimations(); }
              else { svg.pauseAnimations(); }
            } catch (e) { /* SMIL pause API not available; ignore */ }
          });
        }, { threshold: 0.2 });
        svgIo.observe(svg);
      });
    }
  }
  if (reduceMotion) {
    document.querySelectorAll(".flow-dot").forEach(function (dot) { dot.style.display = "none"; });
  }

  /* ---------- interactive tree animation ---------- */
  var iTree = document.getElementById("interactiveTree");
  if (iTree && "IntersectionObserver" in window) {
    var treeIo = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        iTree.classList.add("is-drawn");
        treeIo.disconnect();
      }
    }, { rootMargin: "0px 0px -15% 0px" });
    treeIo.observe(iTree);

    // Interactive branch to line highlight links
    var treeCards = iTree.querySelectorAll(".i-card");
    var linePurple = iTree.querySelector(".i-line--purple");
    var linePink = iTree.querySelector(".i-line--pink");
    var lineYellow = iTree.querySelector(".i-line--yellow");
    var allTreeLines = [linePurple, linePink, lineYellow].filter(Boolean);

    var branchMap = {
      "supervised": linePurple,
      "unsupervised": linePink,
      "reinforcement": lineYellow
    };

    treeCards.forEach(function (card) {
      var branchKey = card.getAttribute("data-branch");
      var targetLine = branchMap[branchKey];

      function highlightBranch() {
        if (!targetLine) return;
        allTreeLines.forEach(function (line) {
          if (line === targetLine) {
            line.classList.add("is-highlighted");
            line.classList.remove("is-dimmed");
          } else {
            line.classList.add("is-dimmed");
            line.classList.remove("is-highlighted");
          }
        });
      }

      function resetBranches() {
        allTreeLines.forEach(function (line) {
          line.classList.remove("is-highlighted");
          line.classList.remove("is-dimmed");
        });
      }

      card.addEventListener("mouseenter", highlightBranch);
      card.addEventListener("focus", highlightBranch);
      card.addEventListener("mouseleave", resetBranches);
      card.addEventListener("blur", resetBranches);
    });
  }

  /* ---------- AI / ML / DL Hierarchy Interactive ---------- */
  var hierarchyFig = document.getElementById("aiHierarchyFig");
  if (hierarchyFig) {
    var nodes = hierarchyFig.querySelectorAll(".ai-node");
    var tabs = hierarchyFig.querySelectorAll(".ai-tab");
    var panels = hierarchyFig.querySelectorAll(".ai-panel");

    function setActiveHierarchy(targetKey) {
      if (!targetKey) return;

      // Update tabs
      tabs.forEach(function (tab) {
        var isMatch = tab.getAttribute("data-target") === targetKey;
        tab.classList.toggle("is-active", isMatch);
        tab.setAttribute("aria-selected", isMatch ? "true" : "false");
      });

      // Update SVG nodes
      nodes.forEach(function (node) {
        var isMatch = node.getAttribute("data-section") === targetKey;
        node.classList.toggle("is-active", isMatch);
      });

      // Update explanation panels
      panels.forEach(function (panel) {
        var isMatch = panel.getAttribute("data-panel") === targetKey;
        panel.classList.toggle("is-active", isMatch);
      });
    }

    nodes.forEach(function (node) {
      var key = node.getAttribute("data-section");
      node.addEventListener("mouseenter", function () {
        setActiveHierarchy(key);
      });
      node.addEventListener("click", function (e) {
        e.stopPropagation();
        setActiveHierarchy(key);
      });
      node.addEventListener("focus", function () {
        setActiveHierarchy(key);
      });
    });

    tabs.forEach(function (tab) {
      var key = tab.getAttribute("data-target");
      tab.addEventListener("mouseenter", function () {
        setActiveHierarchy(key);
      });
      tab.addEventListener("click", function () {
        setActiveHierarchy(key);
      });
    });
  }

  /* ---------- generic scroll animations ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var scrollAnimElements = document.querySelectorAll(".animate-on-scroll");
    var animIo = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    
    scrollAnimElements.forEach(function(el) { animIo.observe(el); });
  }

  /* ---------- Lesson 2: Preprocessing Pipeline Interactivity ---------- */
  var pipelineContainer = document.getElementById("pipelineContainer");
  if (pipelineContainer) {
    var stepButtons = pipelineContainer.querySelectorAll(".pipeline-step-btn");
    var stepBadge = document.getElementById("stepBadge");
    var stepTitle = document.getElementById("stepTitle");
    var stepDesc = document.getElementById("stepDesc");
    var stepTip = document.getElementById("stepTip");
    var sandboxFilename = document.getElementById("sandboxFilename");
    var codeSnippet = document.getElementById("codeSnippet");
    var runCodeBtn = document.getElementById("runCodeBtn");
    var copyCodeBtn = document.getElementById("copyCodeBtn");
    var copyBtnText = document.getElementById("copyBtnText");
    var consoleOutput = document.getElementById("consoleOutput");
    var consoleStatus = document.getElementById("consoleStatus");
    var prevStepBtn = document.getElementById("prevStepBtn");
    var nextStepBtn = document.getElementById("nextStepBtn");

    var currentStep = 1;

    var pipelineSteps = {
      1: {
        badge: "Task 1 of 7",
        title: "1. Acquire the dataset",
        desc: "Gathering raw data from files, databases, APIs, or sensors. Raw data is often stored as a CSV (comma-separated values) file containing individual records (rows) and attributes (columns).",
        tip: "💡 <strong>Key Takeaway:</strong> In this lecture, we acquire <code>Data.csv</code> containing 10 customer records with Country, Age, Salary, and whether they Purchased a product.",
        filename: "step_1_acquire.py",
        code: `# Task 1: Acquire the dataset\n# Data can be gathered from databases, online APIs, or CSV files.\n# In our project folder, we have 'Data.csv' representing customer purchases:\n\ndata_source = "Data.csv"\nprint(f"Acquired dataset file: '{data_source}' successfully.")\nprint("Columns present: ['Country', 'Age', 'Salary', 'Purchased']")`,
        output: `<span style="color:#34D399;">✓ Dataset acquired: 'Data.csv'</span>\nFile size: 10 records, 4 columns.\n\nRaw CSV content:\n-----------------------------------------\nCountry,Age,Salary,Purchased\nFrance,44,72000,No\nSpain,27,48000,Yes\nGermany,30,54000,No\nSpain,38,61000,No\nGermany,40,,Yes          <-- Missing Salary!\nFrance,35,58000,Yes\nSpain,,52000,No           <-- Missing Age!\nFrance,48,79000,Yes\nGermany,50,83000,No\nFrance,37,67000,Yes\n-----------------------------------------`
      },
      2: {
        badge: "Task 2 of 7",
        title: "2. Import the libraries",
        desc: "Loading the foundational Python libraries for machine learning: NumPy (for fast multi-dimensional matrix operations), Pandas (for tabular data structures and dataframes), Matplotlib (for visualization), and Scikit-Learn (for machine learning models and preprocessing transformers).",
        tip: "💡 <strong>Key Takeaway:</strong> Importing these standard tools at the top of your script equips Python with optimized C/Fortran backends for fast vector arithmetic.",
        filename: "step_2_libraries.py",
        code: `# Task 2: Import the libraries\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nimport sklearn\n\nprint("NumPy version:", np.__version__)\nprint("Pandas version:", pd.__version__)\nprint("Scikit-learn version:", sklearn.__version__)`,
        output: `<span style="color:#34D399;">✓ Libraries imported successfully:</span>\n• NumPy       (v2.3.5) — High-performance multidimensional arrays\n• Pandas      (v2.2.3) — Dataframe manipulation and CSV loading\n• Matplotlib  (v3.9.2) — Data plotting and chart visualization\n• Scikit-learn(v1.7.2) — Machine learning estimators & transformers\n\nEnvironment ready for data preprocessing.`
      },
      3: {
        badge: "Task 3 of 7",
        title: "3. Import the dataset",
        desc: "Reading the CSV into a Pandas DataFrame with pd.read_csv('Data.csv') and splitting it into the independent feature matrix (X) and dependent target vector (y). In machine learning, X contains the clues we predict from, and y contains the actual answers.",
        tip: "💡 <strong>Key Takeaway:</strong> In Python, <code>iloc[:, :-1]</code> selects all columns except the last one for <code>X</code>, and <code>iloc[:, -1]</code> isolates the last column for <code>y</code>.",
        filename: "step_3_import_dataset.py",
        code: `# Task 3: Import the dataset and split X and y\nimport pandas as pd\n\ndataset = pd.read_csv('Data.csv')\n\n# Independent features matrix (Country, Age, Salary)\nx = dataset.iloc[:, :-1].values\n\n# Dependent target vector (Purchased: Yes/No)\ny = dataset.iloc[:, -1].values\n\nprint("Dataset head (first 5 rows):")\nprint(dataset.head())\nprint("\\nFeature matrix X shape:", x.shape)\nprint("Target vector y shape:", y.shape)`,
        output: `<span style="color:#93C5FD;">>>> dataset.head()</span>\n<table class="console-df-table"><thead><tr><th class="col-index">#</th><th>Country</th><th>Age</th><th>Salary</th><th>Purchased</th></tr></thead><tbody><tr><td class="col-index">0</td><td class="cell-str">France</td><td>44.0</td><td>72000.0</td><td class="cell-str">No</td></tr><tr><td class="col-index">1</td><td class="cell-str">Spain</td><td>27.0</td><td>48000.0</td><td class="cell-str">Yes</td></tr><tr><td class="col-index">2</td><td class="cell-str">Germany</td><td>30.0</td><td>54000.0</td><td class="cell-str">No</td></tr><tr><td class="col-index">3</td><td class="cell-str">Spain</td><td>38.0</td><td>61000.0</td><td class="cell-str">No</td></tr><tr><td class="col-index">4</td><td class="cell-str">Germany</td><td>40.0</td><td class="cell-nan">NaN</td><td class="cell-str">Yes</td></tr></tbody></table>\n<span style="color:#FBBF24;">Notice row 4 has Salary = NaN!</span>\n\nFeature matrix X shape: (10, 3)\nTarget vector y shape: (10,)\nTarget values y: ['No', 'Yes', 'No', 'No', 'Yes', 'Yes', 'No', 'Yes', 'No', 'Yes']`
      },
      4: {
        badge: "Task 4 of 7",
        title: "4. Handling missing values",
        desc: "Checking for null values with dataset.isna().sum() and replacing missing numbers using SimpleImputer from Scikit-Learn. Dropping entire rows discards valuable training data, so imputing missing entries with the mean of the existing column values is a standard, robust strategy.",
        tip: "💡 <strong>Key Takeaway:</strong> In our dataset, Spain (Row 6) is missing Age, and Germany (Row 4) is missing Salary. SimpleImputer calculates the mean of available values and replaces the NaNs seamlessly.",
        filename: "step_4_missing_values.py",
        code: `# Task 4: Handling missing values\nimport numpy as np\nfrom sklearn.impute import SimpleImputer\n\n# Check missing counts\nprint("Missing values per column:\\n", dataset.isna().sum())\n\n# Impute missing numerical values using column mean\nimputer = SimpleImputer(missing_values=np.nan, strategy='mean')\nimputer.fit(x[:, 1:3])\nx[:, 1:3] = imputer.transform(x[:, 1:3])\n\nprint("\\nCleaned features X (Notice imputed values):")\nprint(x)`,
        output: `<span style="color:#F59E0B;">Missing values detected:</span>\nCountry:   0\nAge:       1 (Row 6 Spain is missing Age)\nSalary:    1 (Row 4 Germany is missing Salary)\nPurchased: 0\n\n<span style="color:#34D399;">✓ SimpleImputer(strategy='mean') applied:</span>\n• Mean Age calculated: 38.78 years (replaces Spain NaN)\n• Mean Salary calculated: $63,777.78 (replaces Germany NaN)\n\nUpdated X feature matrix:\n[['France'  44.0  72000.0]\n ['Spain'   27.0  48000.0]\n ['Germany' 30.0  54000.0]\n ['Spain'   38.0  61000.0]\n ['Germany' 40.0  <span class="cell-imputed">63777.78</span>]  <-- Imputed Salary!\n ['France'  35.0  58000.0]\n ['Spain'   <span class="cell-imputed">38.78</span> 52000.0]  <-- Imputed Age!\n ['France'  48.0  79000.0]\n ['Germany' 50.0  83000.0]\n ['France'  37.0  67000.0]]`
      },
      5: {
        badge: "Task 5 of 7",
        title: "5. Encode categorical data",
        desc: "Machine learning algorithms compute mathematical equations and cannot calculate gradients on text strings. We use OneHotEncoder with ColumnTransformer to convert nominal features (like Country: France, Spain, Germany) into binary dummy vectors [1,0,0], and LabelEncoder to convert the target (Purchased: Yes/No) into 1s and 0s.",
        tip: "💡 <strong>Key Takeaway:</strong> We do NOT encode Country as 0, 1, 2 because the model would incorrectly assume Germany (2) is 'greater than' France (0). One-Hot Encoding avoids this artificial numerical bias.",
        filename: "step_5_encode_categorical.py",
        code: `# Task 5: Encode categorical data\nfrom sklearn.preprocessing import OneHotEncoder, LabelEncoder\nfrom sklearn.compose import ColumnTransformer\n\n# Encode independent variable 'Country' (Column 0)\nct = ColumnTransformer(\n    transformers=[('encoder', OneHotEncoder(), [0])],\n    remainder='passthrough'\n)\nx = np.array(ct.fit_transform(x))\n\n# Encode dependent target variable 'Purchased' (Yes -> 1, No -> 0)\nle = LabelEncoder()\ny_encoded = le.fit_transform(y)\n\nprint("One-Hot Encoded X (first 3 rows):\\n", x[:3])\nprint("\\nEncoded y target (No=0, Yes=1):\\n", y_encoded)`,
        output: `<span style="color:#34D399;">✓ OneHotEncoder applied to Country:</span>\nColumns expanded into 3 binary dummy indicators:\n[France, Germany, Spain]\n• France  -> [1.0, 0.0, 0.0]\n• Germany -> [0.0, 1.0, 0.0]\n• Spain   -> [0.0, 0.0, 1.0]\n\nFirst 3 rows of transformed X (now 5 columns):\n[[ 1.0  0.0  0.0  44.0  72000.0]  <-- France, 44, 72k\n [ 0.0  0.0  1.0  27.0  48000.0]  <-- Spain,  27, 48k\n [ 0.0  1.0  0.0  30.0  54000.0]] <-- Germany,30, 54k\n\n<span style="color:#34D399;">✓ LabelEncoder applied to target y:</span>\nOriginal: ['No' 'Yes' 'No' 'No' 'Yes' 'Yes' 'No' 'Yes' 'No' 'Yes']\nEncoded:  [0 1 0 0 1 1 0 1 0 1]`
      },
      6: {
        badge: "Task 6 of 7",
        title: "6. Splitting the dataset",
        desc: "Dividing our data into a training set and a test set using train_test_split from Scikit-Learn. A model must never be evaluated on the same data it learned from. Splitting (e.g. 80% train, 20% test) verifies that the model generalizes to new, unseen examples.",
        tip: "💡 <strong>Key Takeaway:</strong> Always split your dataset BEFORE feature scaling to prevent data leakage (information from the test set leaking into the training set).",
        filename: "step_6_split_dataset.py",
        code: `# Task 6: Splitting the dataset into Train and Test sets\nfrom sklearn.model_selection import train_test_split\n\nx_train, x_test, y_train, y_test = train_test_split(\n    x,\n    y,\n    test_size=0.2,\n    random_state=42\n)\n\nprint("x_train shape:", x_train.shape, "y_train shape:", y_train.shape)\nprint("x_test shape: ", x_test.shape,  "y_test shape: ", y_test.shape)\nprint("\\nx_test samples (unseen test set):\\n", x_test)`,
        output: `<span style="color:#34D399;">✓ train_test_split completed (80% Train, 20% Test):</span>\n\n• Training Set (8 samples):\n  x_train shape: (8, 5)\n  y_train: ['Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'No', 'No']\n\n• Testing Set (2 samples):\n  x_test shape:  (2, 5)\n  y_test:  ['No', 'Yes']\n\nx_test samples:\n[[0.0  1.0  0.0  50.0  83000.0]  <-- Germany, 50, $83k (Purchased: No)\n [0.0  0.0  1.0  27.0  48000.0]] <-- Spain,   27, $48k (Purchased: Yes)`
      },
      7: {
        badge: "Task 7 of 7",
        title: "7. Feature scaling",
        desc: "Transforming all features onto a uniform numerical scale using MinMaxScaler (normalization between 0 and 1) or StandardScaler. Because Salary ($48,000 to $83,000) has far larger magnitudes than Age (27 to 50), distance-based algorithms and gradient descent would allow Salary to dominate the loss function completely without scaling.",
        tip: "💡 <strong>Key Takeaway:</strong> Notice we call <code>scaler.fit_transform(x_train)</code> on the training set, but ONLY <code>scaler.transform(x_test)</code> on the test set. We never re-fit on test data!",
        filename: "step_7_feature_scaling.py",
        code: `# Task 7: Feature scaling\nfrom sklearn.preprocessing import MinMaxScaler\n\nscaler = MinMaxScaler()\n\n# Fit on x_train and transform\nx_train = scaler.fit_transform(x_train)\n\n# Transform x_test using training parameters\nx_test = scaler.transform(x_test)\n\nprint("Scaled x_train (first 3 rows):")\nprint(np.round(x_train[:3], 3))\nprint("\\nScaled x_test:")\nprint(np.round(x_test, 3))\nprint("\\n✓ All features now reside in comparable scale [0.0, 1.0]!")`,
        output: `<span style="color:#34D399;">✓ Feature scaling with MinMaxScaler() successful:</span>\nFormula applied: X_norm = (X - X_min) / (X_max - X_min)\n\nx_train scaled (all columns now balanced):\n[[1.    0.    0.    0.278 0.222]\n [1.    0.    0.    0.778 0.741]\n [1.    0.    0.    1.    1.   ]]\n\nx_test scaled (using train parameters):\n[[0.    1.    0.    1.111 1.148]\n [0.    0.    1.   -0.167 -0.148]]\n\n<span style="color:#6EE7B7; font-weight:bold;">★ DATA PREPROCESSING PIPELINE COMPLETED SUCCESSFULLY! ★</span>\nYour dataset is now mathematically clean, encoded, and ready to train machine learning models!`
      }
    };

    function setStep(stepNum) {
      currentStep = stepNum;
      var data = pipelineSteps[stepNum];
      if (!data) return;

      // Update button active state
      stepButtons.forEach(function (btn) {
        var num = parseInt(btn.getAttribute("data-step"), 10);
        var isActive = num === stepNum;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      // Update content
      if (stepBadge) stepBadge.textContent = data.badge;
      if (stepTitle) stepTitle.textContent = data.title;
      if (stepDesc) stepDesc.textContent = data.desc;
      if (stepTip) stepTip.innerHTML = data.tip;
      if (sandboxFilename) sandboxFilename.textContent = data.filename;
      if (codeSnippet) codeSnippet.textContent = data.code;

      // Reset console state
      if (consoleOutput) consoleOutput.innerHTML = 'Click "▶ Run Code" above to execute this task.';
      if (consoleStatus) {
        consoleStatus.className = "console-status console-status--ready";
        consoleStatus.textContent = "Ready to run";
      }

      // Update prev/next button states
      if (prevStepBtn) prevStepBtn.disabled = stepNum <= 1;
      if (nextStepBtn) nextStepBtn.disabled = stepNum >= 7;
    }

    stepButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var stepNum = parseInt(this.getAttribute("data-step"), 10);
        setStep(stepNum);
      });
    });

    if (prevStepBtn) {
      prevStepBtn.addEventListener("click", function () {
        if (currentStep > 1) setStep(currentStep - 1);
      });
    }

    if (nextStepBtn) {
      nextStepBtn.addEventListener("click", function () {
        if (currentStep < 7) setStep(currentStep + 1);
      });
    }

    // Run Code simulation
    if (runCodeBtn) {
      runCodeBtn.addEventListener("click", function () {
        var stepData = pipelineSteps[currentStep];
        if (!stepData) return;

        runCodeBtn.classList.add("is-running");
        runCodeBtn.innerHTML = '<span>Running...</span>';
        if (consoleStatus) {
          consoleStatus.className = "console-status console-status--running";
          consoleStatus.textContent = "Executing...";
        }
        if (consoleOutput) {
          consoleOutput.innerHTML = '<span style="color:#A8A095;">> Executing ' + stepData.filename + ' with Python 3.13...</span>';
        }

        setTimeout(function () {
          runCodeBtn.classList.remove("is-running");
          runCodeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Run Code</span>';
          if (consoleStatus) {
            consoleStatus.className = "console-status console-status--success";
            consoleStatus.textContent = "Finished in 0.04s";
          }
          if (consoleOutput) {
            consoleOutput.innerHTML = stepData.output;
          }
        }, 320);
      });
    }

    // Copy Code
    if (copyCodeBtn && codeSnippet) {
      copyCodeBtn.addEventListener("click", function () {
        var textToCopy = codeSnippet.textContent;
        navigator.clipboard.writeText(textToCopy).then(function () {
          if (copyBtnText) copyBtnText.textContent = "Copied!";
          setTimeout(function () {
            if (copyBtnText) copyBtnText.textContent = "Copy";
          }, 2000);
        }).catch(function () {
          // Fallback
          var ta = document.createElement("textarea");
          ta.value = textToCopy;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          if (copyBtnText) copyBtnText.textContent = "Copied!";
          setTimeout(function () {
            if (copyBtnText) copyBtnText.textContent = "Copy";
          }, 2000);
        });
      });
    }
  }

  /* ---------- Lesson 3: EDA Pipeline Interactivity ---------- */
  var edaPipelineContainer = document.getElementById("edaPipelineContainer");
  if (edaPipelineContainer) {
    var edaStepButtons = edaPipelineContainer.querySelectorAll(".eda-step-btn");
    var edaStepBadge = document.getElementById("edaStepBadge");
    var edaStepTitle = document.getElementById("edaStepTitle");
    var edaStepDesc = document.getElementById("edaStepDesc");
    var edaStepTip = document.getElementById("edaStepTip");
    var edaSandboxFilename = document.getElementById("edaSandboxFilename");
    var edaCodeSnippet = document.getElementById("edaCodeSnippet");
    var edaRunCodeBtn = document.getElementById("edaRunCodeBtn");
    var edaCopyCodeBtn = document.getElementById("edaCopyCodeBtn");
    var edaCopyBtnText = document.getElementById("edaCopyBtnText");
    var edaConsoleOutput = document.getElementById("edaConsoleOutput");
    var edaConsoleStatus = document.getElementById("edaConsoleStatus");
    var edaPrevStepBtn = document.getElementById("edaPrevStepBtn");
    var edaNextStepBtn = document.getElementById("edaNextStepBtn");

    var currentEdaStep = 1;

    var edaSteps = {
      1: {
        badge: "Task 1 of 10",
        title: "1. Import Foundational Libraries",
        desc: "Loading the foundational Python libraries for exploratory data science: NumPy (vector & matrix math), Pandas (dataframes & tabular manipulation), Matplotlib (foundational figure rendering), and Seaborn (advanced statistical visualization including heatmaps and pairplots).",
        tip: "💡 <strong>Key Takeaway:</strong> In modern data science, Seaborn acts as a high-level statistical wrapper over Matplotlib — Seaborn designs beautiful statistical plots, while Matplotlib controls figure geometry and labels.",
        filename: "step_1_libraries.py",
        code: `# Step 1: Import foundational libraries\nimport numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n# Show plots inline (when in Jupyter/Colab)\n# %matplotlib inline\n\nprint("Libraries imported successfully:")\nprint("• NumPy:", np.__version__)\nprint("• Pandas:", pd.__version__)\nprint("• Matplotlib:", plt.matplotlib.__version__)\nprint("• Seaborn:", sns.__version__)`,
        output: `<span style="color:#34D399;">✓ Foundational libraries loaded successfully:</span>\n• NumPy       (v2.2.0) — High-performance multidimensional arrays\n• Pandas      (v2.2.3) — DataFrame manipulation and tabular operations\n• Matplotlib  (v3.9.2) — Canvas and chart rendering engine\n• Seaborn     (v0.13.2) — Statistical data visualization (heatmaps, pairplots)\n\nEnvironment initialized. Ready to load and structure dataset.`
      },
      2: {
        badge: "Task 2 of 10",
        title: "2. Load and Structure the Iris Dataset",
        desc: "Loading the iconic Fisher's Iris dataset directly from Scikit-Learn. We construct a 2D Pandas DataFrame from the feature matrix and map the numeric target codes (0, 1, 2) into clear, human-readable botanical species names ('setosa', 'versicolor', 'virginica').",
        tip: "💡 <strong>Key Takeaway:</strong> Never perform EDA with cryptic numeric codes like 0, 1, 2. Converting targets to string labels makes plots, legends, and statistical summaries immediately intelligible.",
        filename: "step_2_load_dataset.py",
        code: `# Step 2: Load dataset & map species labels\nfrom sklearn.datasets import load_iris\nimport pandas as pd\n\niris = load_iris()\ndf = pd.DataFrame(iris.data, columns=iris.feature_names)\ndf['species'] = iris.target\n\n# Convert numeric targets (0, 1, 2) to botanical names\ndf['species'] = df['species'].map({i: label for i, label in enumerate(iris.target_names)})\n\nprint("Dataset head (first 5 records):")\nprint(df.head())`,
        output: `<span style="color:#93C5FD;">>>> df.head()</span>\n<table class="console-df-table"><thead><tr><th class="col-index">#</th><th>sepal length (cm)</th><th>sepal width (cm)</th><th>petal length (cm)</th><th>petal width (cm)</th><th>species</th></tr></thead><tbody><tr><td class="col-index">0</td><td>5.1</td><td>3.5</td><td>1.4</td><td>0.2</td><td class="cell-str">setosa</td></tr><tr><td class="col-index">1</td><td>4.9</td><td>3.0</td><td>1.4</td><td>0.2</td><td class="cell-str">setosa</td></tr><tr><td class="col-index">2</td><td>4.7</td><td>3.2</td><td>1.3</td><td>0.2</td><td class="cell-str">setosa</td></tr><tr><td class="col-index">3</td><td>4.6</td><td>3.1</td><td>1.5</td><td>0.2</td><td class="cell-str">setosa</td></tr><tr><td class="col-index">4</td><td>5.0</td><td>3.6</td><td>1.4</td><td>0.2</td><td class="cell-str">setosa</td></tr></tbody></table>\n<span style="color:#34D399;">✓ Dataset packaged into DataFrame:</span> 150 rows &times; 5 columns (4 numerical features, 1 target label).`
      },
      3: {
        badge: "Task 3 of 10",
        title: "3. Inspect Dataset Structure & Summary Statistics",
        desc: "Executing <code>df.info()</code> reveals DataFrame dimensions (150 rows, 5 columns), memory footprint (6.0 KB), and column datatypes (4 float64, 1 object). Executing <code>df.describe()</code> computes the Five-Number Summary (Min, 25%, Median, 75%, Max) along with Mean and Standard Deviation.",
        tip: "💡 <strong>Key Takeaway:</strong> <code>df.describe()</code> is the quickest baseline sanity check: if minimum values were negative for physical lengths or maximum values were 9999, you would immediately catch measurement errors.",
        filename: "step_3_info_summary.py",
        code: `# Step 3: Inspect structure and statistical summary\nprint("=== DataFrame Structure (df.info()) ===")\ndf.info()\n\nprint("\\n=== Five-Number Summary (df.describe()) ===")\nprint(df.describe().round(2))`,
        output: `=== DataFrame Structure (df.info()) ===\n&lt;class 'pandas.core.frame.DataFrame'&gt;\nRangeIndex: 150 entries, 0 to 149\nData columns (total 5 columns):\n #   Column             Non-Null Count  Dtype  \n---  ------             --------------  -----  \n 0   sepal length (cm)  150 non-null    float64\n 1   sepal width (cm)   150 non-null    float64\n 2   petal length (cm)  150 non-null    float64\n 3   petal width (cm)   150 non-null    float64\n 4   species            150 non-null    object \ndtypes: float64(4), object(1)\nmemory usage: 6.0+ KB\n\n=== Five-Number Summary (df.describe()) ===\n       sepal length  sepal width  petal length  petal width\ncount        150.00       150.00        150.00       150.00\nmean           5.84         3.06          3.76         1.20\nstd            0.83         0.44          1.77         0.76\nmin            4.30         2.00          1.00         0.10\n25%            5.10         2.80          1.60         0.30\n50%            5.80         3.00          4.35         1.30\n75%            6.40         3.30          5.10         1.80\nmax            7.90         4.40          6.90         2.50`
      },
      4: {
        badge: "Task 4 of 10",
        title: "4. Check Missing Values (Nulls)",
        desc: "Checking for unrecorded, blank, or NaN (Not a Number) values across all columns using <code>df.isnull().sum()</code>. Missing entries can silently break mathematical estimators or inject severe bias into machine learning models.",
        tip: "💡 <strong>Key Takeaway:</strong> In contrast to Lesson 2's dataset where missing Age and Salary required SimpleImputer, the Iris dataset is 100% complete with 0 missing values across all 150 samples.",
        filename: "step_4_missing_values.py",
        code: `# Step 4: Check missing values\nmissing = df.isnull().sum()\nprint("Missing values per column:")\nprint(missing)\n\nprint("\\nTotal missing values in dataset:", missing.sum())`,
        output: `Missing values per column:\nsepal length (cm)    0\nsepal width (cm)     0\npetal length (cm)    0\npetal width (cm)     0\nspecies              0\ndtype: int64\n\n<span style="color:#34D399; font-weight:bold;">✓ Zero missing values detected (100% complete)!</span>\nNo row removal or imputation (mean/median/KNN) needed for this dataset.`
      },
      5: {
        badge: "Task 5 of 10",
        title: "5. Feature Distributions (Histograms)",
        desc: "Plotting frequency histograms for each feature using <code>df.hist(figsize=(10,8))</code> reveals the shape, spread, modality, and skewness of the underlying measurements.",
        tip: "💡 <strong>Key Takeaway:</strong> Notice how Sepal Width follows a classic unimodal Gaussian bell curve centered at 3.0 cm, whereas Petal Length and Petal Width exhibit bimodal distributions with a distinct valley separating small petals from larger ones.",
        filename: "step_5_histograms.py",
        code: `# Step 5: Plot histograms for numerical columns\nimport matplotlib.pyplot as plt\n\ndf.hist(figsize=(10, 8), bins=10, color='#0EA894', edgecolor='#1F2937')\nplt.suptitle("Distribution of numerical variables", fontsize=14)\nplt.tight_layout()\nplt.show()`,
        output: `<span style="color:#34D399;">✓ Generating 4-panel histogram grid...</span>\n\nDistribution shapes discovered:\n┌───────────────────┬──────────────────────────────────────────┐\n│ Feature           │ Observed Distribution Shape              │\n├───────────────────┼──────────────────────────────────────────┤\n│ sepal length (cm) │ Roughly Gaussian, slight right skew      │\n│ sepal width (cm)  │ Normal (bell curve) centered at ~3.0 cm  │\n│ petal length (cm) │ Bimodal: dense cluster [1-2], hump [4-6] │\n│ petal width (cm)  │ Bimodal: peak at [0.1-0.4], peak at ~1.5 │\n└───────────────────┴──────────────────────────────────────────┘\n<span style="color:#FBBF24;">★ Key Insight:</span> The gap between 2.0 cm and 3.0 cm in petal length indicates a clean natural separation between species!`
      },
      6: {
        badge: "Task 6 of 10",
        title: "6. Target Distribution & Class Balance",
        desc: "Counting instances of each target category with <code>df['species'].value_counts()</code> and visualizing with <code>sns.countplot()</code>. An unbalanced target (e.g. 95% Class A, 5% Class B) can severely distort classification accuracy.",
        tip: "💡 <strong>Key Takeaway:</strong> The Iris dataset is an exquisitely balanced benchmark: exactly 50 samples per species. Every class represents exactly 33.33% of the dataset.",
        filename: "step_6_species_count.py",
        code: `# Step 6: Verify target balance\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\nprint("Target Class Counts:")\nprint(df['species'].value_counts())\n\nsns.countplot(x='species', data=df, palette=['#0EA894', '#F59E0B', '#6366F1'])\nplt.title("Species Distribution")\nplt.show()`,
        output: `Target Class Counts:\nspecies\nsetosa        50\nversicolor    50\nvirginica     50\nName: count, dtype: int64\n\nClass Balance Breakdown:\n• setosa:     50 samples (33.33%) [████████████████]\n• versicolor: 50 samples (33.33%) [████████████████]\n• virginica:  50 samples (33.33%) [████████████████]\n\n<span style="color:#34D399;">✓ Perfectly balanced target.</span>\nZero majority-class bias. No class weighting or SMOTE synthetic oversampling required.`
      },
      7: {
        badge: "Task 7 of 10",
        title: "7. Pairplot: Multivariate Feature Relationships",
        desc: "Calling <code>sns.pairplot(df, hue='species')</code> creates a full grid of pairwise scatter plots with diagonal KDE probability curves, color-coded by species. It is the single most informative multi-variable exploratory visualization.",
        tip: "💡 <strong>Key Takeaway:</strong> In the <code>petal length</code> vs. <code>petal width</code> projection, Iris setosa forms a completely isolated cluster with zero overlap! A single straight boundary can separate Setosa with 100% precision.",
        filename: "step_7_pairplot.py",
        code: `# Step 7: Multivariate pairplot with species hue\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\nsns.pairplot(df, hue='species', palette=['#0EA894', '#F59E0B', '#6366F1'])\nplt.suptitle("Pairwise Relationships Across Features", y=1.02)\nplt.show()`,
        output: `<span style="color:#34D399;">✓ Pairplot rendered (16 subplots: 12 scatter plots + 4 KDE distributions)</span>\n\nVisual Insights Discovered:\n1. <span style="color:#60A5FA; font-weight:bold;">Iris setosa:</span> Forms a tight, completely isolated cluster on every petal projection. Linearly separable with 100% accuracy.\n2. <span style="color:#F59E0B; font-weight:bold;">Iris versicolor vs virginica:</span> Moderate overlap in sepal dimensions, but petal length (&gt;4.8 cm) and petal width (&gt;1.6 cm) separate ~95% of points cleanly.\n3. Feature combination with highest discriminative power: <strong>Petal Length &times; Petal Width</strong>.`
      },
      8: {
        badge: "Task 8 of 10",
        title: "8. Correlation Matrix & Heatmap",
        desc: "Calculating Pearson's linear correlation coefficient ($r$) among all numerical features using <code>df.corr()</code> and displaying an annotated heatmap with <code>sns.heatmap(..., annot=True)</code>. Values range from -1.0 (inverse) to +1.0 (direct).",
        tip: "💡 <strong>Key Takeaway:</strong> <code>petal length</code> and <code>petal width</code> have an astounding correlation of <strong>+0.96</strong>! This indicates severe multicollinearity — as petals grow longer, they almost always grow proportionally wider.",
        filename: "step_8_correlation.py",
        code: `# Step 8: Correlation matrix and heatmap\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ncorr = df.select_dtypes(include=['float64','int64']).corr()\nprint("Pearson Correlation Matrix:\\n", corr.round(3))\n\nplt.figure(figsize=(7, 5))\nsns.heatmap(corr, annot=True, cmap='coolwarm', vmin=-1, vmax=1)\nplt.title("Correlation Matrix Heatmap")\nplt.show()`,
        output: `Pearson Correlation Matrix:\n                   sepal length  sepal width  petal length  petal width\nsepal length              1.000       -0.118         0.872        0.818\nsepal width              -0.118        1.000        -0.428       -0.366\npetal length              0.872       -0.428         1.000        0.963\npetal width               0.818       -0.366         0.963        1.000\n\nCorrelation Summary:\n• <span style="color:#EF4444; font-weight:bold;">Petal Length &amp; Petal Width (+0.96):</span> Extremely strong positive linear dependency.\n• <span style="color:#F97316; font-weight:bold;">Sepal Length &amp; Petal Length (+0.87):</span> Strong positive correlation.\n• <span style="color:#60A5FA; font-weight:bold;">Sepal Width &amp; Petal Length (-0.43):</span> Moderate negative correlation (wider sepals often have shorter petals).\n• <span style="color:#9CA3AF; font-weight:bold;">Sepal Length &amp; Sepal Width (-0.12):</span> Virtually independent.`
      },
      9: {
        badge: "Task 9 of 10",
        title: "9. Outlier Detection with Boxplots & IQR",
        desc: "Executing <code>df.boxplot()</code> renders the 5-number summary (Min, Q1, Median, Q3, Max) and identifies anomalous data points plotting beyond the $1.5 \times \text{IQR}$ whiskers.",
        tip: "💡 <strong>Key Takeaway:</strong> Only <code>sepal width</code> contains any outliers (points below 2.05 cm and above 4.05 cm). Sepal Length, Petal Length, and Petal Width have 0 outliers, confirming high data reliability.",
        filename: "step_9_outlier_boxplots.py",
        code: `# Step 9: Boxplots for outlier detection\nimport matplotlib.pyplot as plt\n\nplt.figure(figsize=(10, 6))\ndf.boxplot()\nplt.title("Boxplots for Outlier Detection")\nplt.ylabel("Centimeters (cm)")\nplt.show()`,
        output: `<span style="color:#34D399;">✓ Generating 4 boxplots across features:</span>\n\nOutlier Diagnostic Report:\n• <span style="color:#34D399;">sepal length (cm):</span> Min=4.3, Q1=5.1, Median=5.8, Q3=6.4, Max=7.9 &rarr; <strong>0 outliers</strong>\n• <span style="color:#F59E0B; font-weight:bold;">sepal width (cm):</span> Min=2.0, Q1=2.8, Median=3.0, Q3=3.3, Max=4.4 &rarr; <strong>4 mild outliers</strong> detected:\n  - Upper: 4.4 cm, 4.2 cm, 4.1 cm (exceeds Q3 + 1.5*IQR = 4.05 cm)\n  - Lower: 2.0 cm (falls below Q1 - 1.5*IQR = 2.05 cm)\n• <span style="color:#34D399;">petal length (cm):</span> IQR span [1.6 to 5.1] &rarr; <strong>0 outliers</strong>\n• <span style="color:#34D399;">petal width (cm):</span> IQR span [0.3 to 1.8] &rarr; <strong>0 outliers</strong>\n\nConclusion: Outliers in Sepal Width are natural biological extremes rather than sensor errors; keeping them preserves model robustness.`
      },
      10: {
        badge: "Task 10 of 10",
        title: "10. Extracting Insights with Group Aggregations",
        desc: "Aggregating feature averages grouped by species with <code>df.groupby('species').mean()</code> transforms raw statistical distributions into clear, actionable physical rules that explain why machine learning classifiers succeed.",
        tip: "💡 <strong>Key Takeaway:</strong> Setosa has noticeably small petals (mean 1.46 cm &times; 0.25 cm) but the widest sepals (3.43 cm). Virginica has the largest petals (5.55 cm &times; 2.03 cm) and longest sepals (6.59 cm). Versicolor is consistently right in the middle.",
        filename: "step_10_insights.py",
        code: `# Step 10: Species mean measurements and domain takeaways\nprint("Average measurements per species:\\n")\nmeans = df.groupby('species').mean()\nprint(means.round(3))\n\nprint("\\nKey Takeaway: Features cleanly stratify species from smallest to largest.")`,
        output: `Average measurements per species:\n\n            sepal length  sepal width  petal length  petal width\nspecies                                                         \nsetosa             5.006        3.428         1.462        0.246\nversicolor         5.936        2.770         4.260        1.326\nvirginica          6.588        2.974         5.552        2.026\n\n<span style="color:#6EE7B7; font-weight:bold;">★ EXPLORATORY DATA ANALYSIS (EDA) FULLY COMPLETED! ★</span>\nWe have:\n1. Verified 100% data integrity (0 missing values, valid ranges).\n2. Found clear linear class boundaries in petal features.\n3. Uncovered strong multicollinearity between Petal Length &amp; Petal Width (r = 0.96).\n4. Confirmed balanced classes (50 per species).\n\nDataset is now thoroughly understood and ready for Lesson 4: Supervised Learning!`
      }
    };

    function setEdaStep(stepNum) {
      currentEdaStep = stepNum;
      var data = edaSteps[stepNum];
      if (!data) return;

      edaStepButtons.forEach(function (btn) {
        var num = parseInt(btn.getAttribute("data-step"), 10);
        var isActive = num === stepNum;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      if (edaStepBadge) edaStepBadge.textContent = data.badge;
      if (edaStepTitle) edaStepTitle.textContent = data.title;
      if (edaStepDesc) edaStepDesc.innerHTML = data.desc;
      if (edaStepTip) edaStepTip.innerHTML = data.tip;
      if (edaSandboxFilename) edaSandboxFilename.textContent = data.filename;
      if (edaCodeSnippet) edaCodeSnippet.textContent = data.code;

      if (edaConsoleOutput) edaConsoleOutput.innerHTML = 'Click "▶ Run Code" above to execute this task.';
      if (edaConsoleStatus) {
        edaConsoleStatus.className = "console-status console-status--ready";
        edaConsoleStatus.textContent = "Ready to run";
      }

      if (edaPrevStepBtn) edaPrevStepBtn.disabled = stepNum <= 1;
      if (edaNextStepBtn) edaNextStepBtn.disabled = stepNum >= 10;
    }

    edaStepButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var stepNum = parseInt(this.getAttribute("data-step"), 10);
        setEdaStep(stepNum);
      });
    });

    if (edaPrevStepBtn) {
      edaPrevStepBtn.addEventListener("click", function () {
        if (currentEdaStep > 1) setEdaStep(currentEdaStep - 1);
      });
    }

    if (edaNextStepBtn) {
      edaNextStepBtn.addEventListener("click", function () {
        if (currentEdaStep < 10) setEdaStep(currentEdaStep + 1);
      });
    }

    if (edaRunCodeBtn) {
      edaRunCodeBtn.addEventListener("click", function () {
        var stepData = edaSteps[currentEdaStep];
        if (!stepData) return;

        edaRunCodeBtn.classList.add("is-running");
        edaRunCodeBtn.innerHTML = '<span>Running...</span>';
        if (edaConsoleStatus) {
          edaConsoleStatus.className = "console-status console-status--running";
          edaConsoleStatus.textContent = "Executing...";
        }
        if (edaConsoleOutput) {
          edaConsoleOutput.innerHTML = '<span style="color:#A8A095;">> Executing ' + stepData.filename + ' with Python 3.13...</span>';
        }

        setTimeout(function () {
          edaRunCodeBtn.classList.remove("is-running");
          edaRunCodeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>Run Code</span>';
          if (edaConsoleStatus) {
            edaConsoleStatus.className = "console-status console-status--success";
            edaConsoleStatus.textContent = "Finished in 0.05s";
          }
          if (edaConsoleOutput) {
            edaConsoleOutput.innerHTML = stepData.output;
          }
        }, 320);
      });
    }

    if (edaCopyCodeBtn && edaCodeSnippet) {
      edaCopyCodeBtn.addEventListener("click", function () {
        var textToCopy = edaCodeSnippet.textContent;
        navigator.clipboard.writeText(textToCopy).then(function () {
          if (edaCopyBtnText) edaCopyBtnText.textContent = "Copied!";
          setTimeout(function () {
            if (edaCopyBtnText) edaCopyBtnText.textContent = "Copy";
          }, 2000);
        }).catch(function () {
          var ta = document.createElement("textarea");
          ta.value = textToCopy;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          if (edaCopyBtnText) edaCopyBtnText.textContent = "Copied!";
          setTimeout(function () {
            if (edaCopyBtnText) edaCopyBtnText.textContent = "Copy";
          }, 2000);
        });
      });
    }
  }

  /* ---------- Lesson 3: Valuable Charts & Plots Explorer ---------- */
  var chartsExplorer = document.getElementById("chartsExplorer");
  if (chartsExplorer) {
    var chartTabs = chartsExplorer.querySelectorAll(".chart-tab-btn");
    var chartRows = chartsExplorer.querySelectorAll(".chart-row");

    var studioIcon = document.getElementById("studioPlotIcon") || document.getElementById("spotlightIcon");
    var studioName = document.getElementById("studioPlotName") || document.getElementById("spotlightName");
    var studioTag = document.getElementById("studioPlotTag") || document.getElementById("spotlightTag");
    var studioScope = document.getElementById("studioScope") || document.getElementById("spotlightScope");
    var studioLearn = document.getElementById("studioLearn") || document.getElementById("spotlightLearn");
    var studioCanvas = document.getElementById("studioCanvasWrapper") || document.getElementById("spotlightCanvasWrapper");
    var studioTooltipText = document.getElementById("studioTooltipText") || document.getElementById("spotlightTooltipText");
    var studioTakeaway = document.getElementById("studioTakeaway") || document.getElementById("spotlightTakeaway");
    var studioCodeSnippet = document.getElementById("studioCodeSnippet");

    var chartsData = {
      histogram: {
        icon: "📊",
        name: "Histogram",
        tag: "Continuous Distribution & Shape",
        scope: "One numerical variable (e.g. Sepal Length)",
        learn: "Distribution, skewness, shape & modal peaks",
        takeaway: "Splits a continuous variable into equal intervals (bins). The height of each bar reveals where values cluster, whether data is symmetric (normal bell curve) or skewed, and where peak modes occur.",
        code: "sns.histplot(df['sepal length (cm)'], kde=True)",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <line x1="30" y1="15" x2="30" y2="110" stroke="var(--line-bold)" stroke-width="1.5"/>
          <line x1="30" y1="110" x2="305" y2="110" stroke="var(--line-bold)" stroke-width="1.5"/>
          <text x="25" y="15" fill="var(--ink-muted)" font-size="8.5" font-family="var(--sans)" text-anchor="end">Count</text>
          <text x="300" y="123" fill="var(--ink-muted)" font-size="8.5" font-family="var(--sans)" text-anchor="end">Length (cm) &rarr;</text>
          <rect class="chart-elem" x="38" y="85" width="32" height="25" rx="3" fill="#0EA894" opacity="0.6" data-tip="Bin 4.0-4.5 cm: 5 samples (Low density)"/>
          <rect class="chart-elem" x="74" y="55" width="32" height="55" rx="3" fill="#0EA894" opacity="0.8" data-tip="Bin 4.5-5.0 cm: 27 samples"/>
          <rect class="chart-elem" x="110" y="20" width="32" height="90" rx="3" fill="#0EA894" data-tip="Bin 5.0-5.5 cm: 36 samples (Peak Modal Density)"/>
          <rect class="chart-elem" x="146" y="32" width="32" height="78" rx="3" fill="#0EA894" opacity="0.9" data-tip="Bin 5.5-6.0 cm: 30 samples"/>
          <rect class="chart-elem" x="182" y="50" width="32" height="60" rx="3" fill="#0EA894" opacity="0.8" data-tip="Bin 6.0-6.5 cm: 24 samples"/>
          <rect class="chart-elem" x="218" y="75" width="32" height="35" rx="3" fill="#0EA894" opacity="0.7" data-tip="Bin 6.5-7.0 cm: 18 samples"/>
          <rect class="chart-elem" x="254" y="92" width="32" height="18" rx="3" fill="#0EA894" opacity="0.5" data-tip="Bin 7.0-7.9 cm: 10 samples (Right Tail)"/>
          <text x="54" y="122" fill="var(--ink-muted)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">4.5</text>
          <text x="126" y="122" fill="var(--ink-muted)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">5.5</text>
          <text x="198" y="122" fill="var(--ink-muted)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">6.5</text>
          <text x="270" y="122" fill="var(--ink-muted)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">7.5</text>
          <rect x="94" y="6" width="64" height="12" rx="3" fill="var(--teal-tint)"/>
          <text x="126" y="15" fill="var(--teal-dark)" font-size="8" font-weight="700" font-family="var(--sans)" text-anchor="middle">Peak Mode</text>
        </svg>`
      },
      boxplot: {
        icon: "📦",
        name: "Box Plot",
        tag: "Five-Number Summary & Outliers",
        scope: "One numerical variable (e.g. Sepal Width)",
        learn: "Median, spread (IQR), and anomalous outliers",
        takeaway: "Visualizes the 5-point distribution summary (Min, Q1, Median, Q3, Max). Points positioned past 1.5×IQR boundaries are instantly flagged as statistical outliers for data cleaning.",
        code: "sns.boxplot(y=df['sepal width (cm)'])",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <line x1="20" y1="115" x2="300" y2="115" stroke="var(--line)" stroke-width="1"/>
          <!-- Whiskers -->
          <line x1="60" y1="65" x2="110" y2="65" stroke="#64748B" stroke-width="2"/>
          <line x1="60" y1="46" x2="60" y2="84" stroke="#64748B" stroke-width="2.5" class="chart-elem" data-tip="Min Whisker: 2.0 cm (Lower boundary = Q1 - 1.5*IQR)"/>
          <line x1="210" y1="65" x2="260" y2="65" stroke="#64748B" stroke-width="2"/>
          <line x1="260" y1="46" x2="260" y2="84" stroke="#64748B" stroke-width="2.5" class="chart-elem" data-tip="Max Whisker: 4.0 cm (Upper boundary = Q3 + 1.5*IQR)"/>
          <!-- IQR Box -->
          <rect class="chart-elem" x="110" y="38" width="100" height="54" rx="4" fill="rgba(14, 168, 148, 0.15)" stroke="#0EA894" stroke-width="2" data-tip="IQR Box: Middle 50% of values [Q1: 2.8 cm to Q3: 3.3 cm]"/>
          <!-- Median Line -->
          <line class="chart-elem" x1="155" y1="38" x2="155" y2="92" stroke="#EF4444" stroke-width="3" data-tip="Median (Q2): 3.0 cm (Central 50th percentile)"/>
          <!-- Labels -->
          <text x="60" y="100" fill="var(--ink-muted)" font-size="8" font-family="var(--mono)" text-anchor="middle">Min 2.0</text>
          <text x="110" y="30" fill="var(--ink-muted)" font-size="8" font-family="var(--mono)" text-anchor="middle">Q1 2.8</text>
          <text x="155" y="24" fill="#EF4444" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">Median 3.0</text>
          <text x="210" y="30" fill="var(--ink-muted)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">Q3 3.3</text>
          <text x="260" y="100" fill="var(--ink-muted)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">Max 4.0</text>
          <!-- Outliers -->
          <circle class="chart-elem" cx="36" cy="65" r="5" fill="#F59E0B" stroke="#B45309" stroke-width="1.5" data-tip="Lower Outlier: 1.8 cm (< Q1 - 1.5*IQR)"/>
          <text x="36" y="80" fill="#B45309" font-size="8" font-weight="700" font-family="var(--mono)" text-anchor="middle">Outlier</text>
          <circle class="chart-elem" cx="286" cy="65" r="5" fill="#F59E0B" stroke="#B45309" stroke-width="1.5" data-tip="Upper Outlier: 4.4 cm (> Q3 + 1.5*IQR)"/>
          <text x="286" y="80" fill="#B45309" font-size="8" font-weight="700" font-family="var(--mono)" text-anchor="middle">Outlier</text>
        </svg>`
      },
      scatter: {
        icon: "🔵",
        name: "Scatter Plot",
        tag: "Bivariate Association & Clusters",
        scope: "Two numerical variables (e.g. Petal L vs Petal W)",
        learn: "Relationship/correlation & linear separability",
        takeaway: "Plots paired observations on Cartesian coordinates. Reveals linear dependency, direction (+/-), and whether classes form isolated, easily separable clusters for classification.",
        code: "sns.scatterplot(x='petal length (cm)', y='petal width (cm)', hue='species', data=df)",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <line x1="32" y1="12" x2="32" y2="112" stroke="var(--line-bold)" stroke-width="1.5"/>
          <line x1="32" y1="112" x2="305" y2="112" stroke="var(--line-bold)" stroke-width="1.5"/>
          <text x="28" y="14" fill="var(--ink-muted)" font-size="8" font-family="var(--sans)" text-anchor="end">Petal W</text>
          <text x="300" y="125" fill="var(--ink-muted)" font-size="8" font-family="var(--sans)" text-anchor="end">Petal L &rarr;</text>
          <line x1="45" y1="98" x2="285" y2="22" stroke="#3B82F6" stroke-width="1.5" stroke-dasharray="3 3"/>
          <text x="175" y="32" fill="#1D4ED8" font-size="8.5" font-weight="700" font-family="var(--mono)">r = +0.96 (Strong Positive)</text>
          <circle class="chart-elem" cx="50" cy="95" r="4" fill="#3B82F6" data-tip="Setosa (PL: 1.4, PW: 0.2) - 100% Separable Cluster"/>
          <circle class="chart-elem" cx="66" cy="90" r="4" fill="#3B82F6" data-tip="Setosa (PL: 1.5, PW: 0.2) - 100% Separable Cluster"/>
          <circle class="chart-elem" cx="80" cy="86" r="4" fill="#3B82F6" data-tip="Setosa (PL: 1.6, PW: 0.4) - 100% Separable Cluster"/>
          <circle class="chart-elem" cx="150" cy="58" r="4" fill="#F59E0B" data-tip="Versicolor (PL: 4.2, PW: 1.3)"/>
          <circle class="chart-elem" cx="170" cy="52" r="4" fill="#F59E0B" data-tip="Versicolor (PL: 4.5, PW: 1.5)"/>
          <circle class="chart-elem" cx="188" cy="46" r="4" fill="#F59E0B" data-tip="Versicolor (PL: 4.7, PW: 1.4)"/>
          <circle class="chart-elem" cx="230" cy="38" r="4" fill="#8B5CF6" data-tip="Virginica (PL: 5.5, PW: 2.0)"/>
          <circle class="chart-elem" cx="250" cy="28" r="4" fill="#8B5CF6" data-tip="Virginica (PL: 6.0, PW: 2.2)"/>
          <circle class="chart-elem" cx="272" cy="20" r="4" fill="#8B5CF6" data-tip="Virginica (PL: 6.7, PW: 2.5)"/>
        </svg>`
      },
      line: {
        icon: "📈",
        name: "Line Chart",
        tag: "Temporal Evolution & Trends",
        scope: "Data over time (e.g. dates, timestamps, epochs)",
        learn: "Trends over time, seasonality, and trajectory",
        takeaway: "Connects observations sequentially along an ordered time axis. Essential for recognizing growth trajectory, periodic seasonal patterns, and sudden anomalies in temporal data.",
        code: "sns.lineplot(data=df, x='time', y='metric')",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <line x1="30" y1="12" x2="30" y2="112" stroke="var(--line-bold)" stroke-width="1.5"/>
          <line x1="30" y1="112" x2="305" y2="112" stroke="var(--line-bold)" stroke-width="1.5"/>
          <text x="25" y="14" fill="var(--ink-muted)" font-size="8" font-family="var(--sans)" text-anchor="end">Metric</text>
          <text x="300" y="125" fill="var(--ink-muted)" font-size="8" font-family="var(--sans)" text-anchor="end">Timeline &rarr;</text>
          <path d="M 40 95 Q 90 80, 140 65 T 240 38 L 290 22 L 290 112 L 40 112 Z" fill="rgba(14, 168, 148, 0.12)"/>
          <path d="M 40 95 Q 90 80, 140 65 T 240 38 L 290 22" stroke="#0EA894" stroke-width="2.5" fill="none"/>
          <circle class="chart-elem" cx="40" cy="95" r="4" fill="#0EA894" stroke="#fff" stroke-width="1.5" data-tip="Month 1: 42 units (Baseline)"/>
          <circle class="chart-elem" cx="95" cy="80" r="4" fill="#0EA894" stroke="#fff" stroke-width="1.5" data-tip="Month 2: 49 units (+16% growth)"/>
          <circle class="chart-elem" cx="145" cy="65" r="4" fill="#0EA894" stroke="#fff" stroke-width="1.5" data-tip="Month 3: 61 units (+24% growth)"/>
          <circle class="chart-elem" cx="200" cy="50" r="4" fill="#0EA894" stroke="#fff" stroke-width="1.5" data-tip="Month 4: 73 units (+20% growth)"/>
          <circle class="chart-elem" cx="250" cy="35" r="4" fill="#0EA894" stroke="#fff" stroke-width="1.5" data-tip="Month 5: 85 units (+16% growth)"/>
          <circle class="chart-elem" cx="290" cy="22" r="4" fill="#0EA894" stroke="#fff" stroke-width="1.5" data-tip="Month 6: 94 units (Peak Trend)"/>
          <text x="40" y="123" fill="var(--ink-muted)" font-size="8" font-family="var(--mono)" text-anchor="middle">M1</text>
          <text x="145" y="123" fill="var(--ink-muted)" font-size="8" font-family="var(--mono)" text-anchor="middle">M3</text>
          <text x="290" y="123" fill="var(--ink-muted)" font-size="8" font-family="var(--mono)" text-anchor="middle">M6</text>
        </svg>`
      },
      bar: {
        icon: "📊",
        name: "Bar Chart",
        tag: "Discrete Category Comparison",
        scope: "Categorical variable (e.g. customer tier, groups)",
        learn: "Frequency/count of categories & metric contrasts",
        takeaway: "Plots metrics across discrete, unordered categories. The visible space between bars signifies categorical boundaries, distinguishing it clearly from continuous histograms.",
        code: "df.groupby('species')['sepal length (cm)'].mean().plot(kind='bar')",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <line x1="25" y1="112" x2="300" y2="112" stroke="var(--line-bold)" stroke-width="1.5"/>
          <rect class="chart-elem" x="35" y="45" width="48" height="67" rx="3" fill="#F59E0B" data-tip="Group A: 65 units"/>
          <text x="59" y="38" fill="#B45309" font-size="9" font-weight="700" font-family="var(--mono)" text-anchor="middle">65</text>
          <text x="59" y="124" fill="var(--ink-muted)" font-size="8.5" font-family="var(--sans)" text-anchor="middle">Group A</text>
          <rect class="chart-elem" x="103" y="18" width="48" height="94" rx="3" fill="#F59E0B" data-tip="Group B: 90 units (Highest Level)"/>
          <text x="127" y="12" fill="#B45309" font-size="9" font-weight="700" font-family="var(--mono)" text-anchor="middle">90</text>
          <text x="127" y="124" fill="var(--ink-muted)" font-size="8.5" font-family="var(--sans)" text-anchor="middle">Group B</text>
          <rect class="chart-elem" x="171" y="62" width="48" height="50" rx="3" fill="#F59E0B" data-tip="Group C: 50 units"/>
          <text x="195" y="55" fill="#B45309" font-size="9" font-weight="700" font-family="var(--mono)" text-anchor="middle">50</text>
          <text x="195" y="124" fill="var(--ink-muted)" font-size="8.5" font-family="var(--sans)" text-anchor="middle">Group C</text>
          <rect class="chart-elem" x="239" y="35" width="48" height="77" rx="3" fill="#F59E0B" data-tip="Group D: 75 units"/>
          <text x="263" y="28" fill="#B45309" font-size="9" font-weight="700" font-family="var(--mono)" text-anchor="middle">75</text>
          <text x="263" y="124" fill="var(--ink-muted)" font-size="8.5" font-family="var(--sans)" text-anchor="middle">Group D</text>
        </svg>`
      },
      pie: {
        icon: "🥧",
        name: "Pie Chart",
        tag: "Proportional Composition",
        scope: "Categorical proportions (3–5 distinct classes)",
        learn: "Percentage/share of the 100% total",
        takeaway: "Represents portions of a whole where all slices sum to 100%. Highly readable for communicating broad high-level market share or balanced species composition.",
        code: "df['species'].value_counts().plot(kind='pie', autopct='%1.1f%%')",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <g transform="translate(160, 66)">
            <path class="chart-elem" d="M 0 0 L 0 -50 A 50 50 0 0 1 43.3 25 Z" fill="#0EA894" data-tip="Setosa: 33.3% (50 flowers)"/>
            <path class="chart-elem" d="M 0 0 L 43.3 25 A 50 50 0 0 1 -43.3 25 Z" fill="#F59E0B" data-tip="Versicolor: 33.3% (50 flowers)"/>
            <path class="chart-elem" d="M 0 0 L -43.3 25 A 50 50 0 0 1 0 -50 Z" fill="#8B5CF6" data-tip="Virginica: 33.3% (50 flowers)"/>
            <circle cx="0" cy="0" r="24" fill="var(--bg)"/>
            <text x="0" y="3" fill="var(--ink)" font-size="9" font-weight="700" font-family="var(--mono)" text-anchor="middle">100%</text>
          </g>
          <text x="230" y="42" fill="#0EA894" font-size="8.5" font-weight="700" font-family="var(--sans)">Setosa 33%</text>
          <text x="205" y="112" fill="#F59E0B" font-size="8.5" font-weight="700" font-family="var(--sans)">Versicolor 33%</text>
          <text x="20" y="80" fill="#8B5CF6" font-size="8.5" font-weight="700" font-family="var(--sans)">Virginica 33%</text>
        </svg>`
      },
      heatmap: {
        icon: "🔥",
        name: "Heatmap",
        tag: "Multivariate Correlation Matrix",
        scope: "Many numerical variables (pairwise matrix)",
        learn: "Correlations/patterns & feature redundancy",
        takeaway: "Encodes multi-feature correlation coefficients into color heat intensity. Highlights dangerous multicollinearity ($r > 0.85$) where two features deliver identical information.",
        code: "sns.heatmap(df.corr(numeric_only=True), annot=True, cmap='coolwarm')",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <text x="97" y="14" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">Sepal L</text>
          <text x="157" y="14" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">Sepal W</text>
          <text x="217" y="14" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">Petal L</text>
          <text x="277" y="14" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">Petal W</text>
          <text x="64" y="36" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="end">Sepal L</text>
          <text x="64" y="66" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="end">Sepal W</text>
          <text x="64" y="96" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="end">Petal L</text>
          <text x="64" y="124" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="end">Petal W</text>
          <rect class="chart-elem" x="72" y="20" width="50" height="24" rx="2" fill="#EF4444" opacity="0.95" data-tip="Sepal L × Sepal L: r = 1.00 (Self-identity)"/>
          <text x="97" y="36" fill="#fff" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">1.00</text>
          <rect class="chart-elem" x="132" y="20" width="50" height="24" rx="2" fill="#94A3B8" opacity="0.3" data-tip="Sepal L × Sepal W: r = -0.12 (Near Zero)"/>
          <text x="157" y="36" fill="var(--ink)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">-0.12</text>
          <rect class="chart-elem" x="192" y="20" width="50" height="24" rx="2" fill="#EF4444" opacity="0.75" data-tip="Sepal L × Petal L: r = 0.87 (High Positive)"/>
          <text x="217" y="36" fill="#fff" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">0.87</text>
          <rect class="chart-elem" x="252" y="20" width="50" height="24" rx="2" fill="#EF4444" opacity="0.7" data-tip="Sepal L × Petal W: r = 0.82 (High Positive)"/>
          <text x="277" y="36" fill="#fff" font-size="8.5" font-family="var(--mono)" text-anchor="middle">0.82</text>
          <rect class="chart-elem" x="72" y="50" width="50" height="24" rx="2" fill="#94A3B8" opacity="0.3" data-tip="Sepal W × Sepal L: r = -0.12"/>
          <text x="97" y="66" fill="var(--ink)" font-size="8.5" font-family="var(--mono)" text-anchor="middle">-0.12</text>
          <rect class="chart-elem" x="132" y="50" width="50" height="24" rx="2" fill="#EF4444" opacity="0.95" data-tip="Sepal W × Sepal W: r = 1.00 (Self-identity)"/>
          <text x="157" y="66" fill="#fff" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">1.00</text>
          <rect class="chart-elem" x="192" y="50" width="50" height="24" rx="2" fill="#3B82F6" opacity="0.45" data-tip="Sepal W × Petal L: r = -0.43 (Moderate Negative)"/>
          <text x="217" y="66" fill="#fff" font-size="8.5" font-family="var(--mono)" text-anchor="middle">-0.43</text>
          <rect class="chart-elem" x="252" y="50" width="50" height="24" rx="2" fill="#3B82F6" opacity="0.4" data-tip="Sepal W × Petal W: r = -0.37"/>
          <text x="277" y="66" fill="#fff" font-size="8.5" font-family="var(--mono)" text-anchor="middle">-0.37</text>
          <rect class="chart-elem" x="192" y="108" width="50" height="24" rx="2" fill="#EF4444" opacity="0.95" data-tip="Petal L × Petal W: r = 0.96 (Collinear Redundancy)"/>
          <text x="217" y="124" fill="#fff" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">0.96</text>
          <rect class="chart-elem" x="252" y="108" width="50" height="24" rx="2" fill="#EF4444" opacity="0.95" data-tip="Petal W × Petal W: r = 1.00 (Self-identity)"/>
          <text x="277" y="124" fill="#fff" font-size="8.5" font-weight="700" font-family="var(--mono)" text-anchor="middle">1.00</text>
        </svg>`
      },
      countplot: {
        icon: "📍",
        name: "Count Plot",
        tag: "Category Frequencies & Balance",
        scope: "Categorical variable (e.g. Iris target species)",
        learn: "Number of observations per category & class balance",
        takeaway: "Counts how many rows exist for each discrete category. In Machine Learning classification, it immediately flags severe class imbalances (e.g. 90% vs 10%) so you can prevent models from biasing toward the majority class.",
        code: "sns.countplot(x='species', data=df)",
        svg: `<svg class="spotlight-svg" viewBox="0 0 320 135" fill="none">
          <text x="82" y="14" fill="var(--ink-muted)" font-size="8.5" font-weight="700" font-family="var(--sans)">Target Class Balance (df['species'].value_counts())</text>
          <line x1="82" y1="20" x2="82" y2="114" stroke="var(--line-bold)" stroke-width="1.5"/>
          <line x1="82" y1="114" x2="295" y2="114" stroke="var(--line)" stroke-width="1"/>
          
          <!-- Row 1: setosa -->
          <text x="74" y="42" fill="var(--ink)" font-size="9.5" font-weight="600" font-family="var(--mono)" text-anchor="end">setosa</text>
          <rect class="chart-elem" x="82" y="28" width="165" height="20" rx="3" fill="#0EA894" data-tip="setosa: exactly 50 samples (33.33% of dataset)"/>
          <text x="254" y="42" fill="var(--teal-dark)" font-size="9.5" font-weight="700" font-family="var(--mono)">50 (33.3%)</text>

          <!-- Row 2: versicolor -->
          <text x="74" y="72" fill="var(--ink)" font-size="9.5" font-weight="600" font-family="var(--mono)" text-anchor="end">versicolor</text>
          <rect class="chart-elem" x="82" y="58" width="165" height="20" rx="3" fill="#F59E0B" data-tip="versicolor: exactly 50 samples (33.33% of dataset)"/>
          <text x="254" y="72" fill="#B45309" font-size="9.5" font-weight="700" font-family="var(--mono)">50 (33.3%)</text>

          <!-- Row 3: virginica -->
          <text x="74" y="102" fill="var(--ink)" font-size="9.5" font-weight="600" font-family="var(--mono)" text-anchor="end">virginica</text>
          <rect class="chart-elem" x="82" y="88" width="165" height="20" rx="3" fill="#8B5CF6" data-tip="virginica: exactly 50 samples (33.33% of dataset)"/>
          <text x="254" y="102" fill="#6D28D9" font-size="9.5" font-weight="700" font-family="var(--mono)">50 (33.3%)</text>

          <!-- Balance Status Indicator -->
          <rect x="82" y="119" width="130" height="13" rx="3" fill="rgba(16, 185, 129, 0.12)"/>
          <text x="147" y="128" fill="#059669" font-size="8" font-weight="700" font-family="var(--sans)" text-anchor="middle">✓ Perfectly Balanced Target</text>
        </svg>`
      }
    };

    function setSpotlight(chartKey, shouldScroll) {
      var data = chartsData[chartKey];
      if (!data) return;

      chartTabs.forEach(function (tab) {
        var k = tab.getAttribute("data-chart");
        var active = (k === chartKey);
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      });

      chartRows.forEach(function (row) {
        var k = row.getAttribute("data-chart");
        row.classList.toggle("is-active", k === chartKey);
      });

      if (studioIcon) studioIcon.textContent = data.icon;
      if (studioName) studioName.textContent = data.name;
      if (studioTag) studioTag.textContent = data.tag;
      if (studioScope) studioScope.textContent = data.scope;
      if (studioLearn) studioLearn.textContent = data.learn;
      if (studioTakeaway) studioTakeaway.textContent = data.takeaway;
      if (studioCodeSnippet && data.code) studioCodeSnippet.textContent = data.code;
      if (studioCanvas) {
        studioCanvas.innerHTML = data.svg;
        attachChartElemTooltips(studioCanvas);
      }
      if (studioTooltipText) {
        studioTooltipText.textContent = "Hover over chart elements to inspect values";
      }

      if (shouldScroll) {
        var studioCard = document.getElementById("chartStudioCard");
        if (studioCard) {
          studioCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }

    function attachChartElemTooltips(container) {
      var elems = container.querySelectorAll(".chart-elem");
      elems.forEach(function (el) {
        el.style.cursor = "pointer";
        el.addEventListener("mouseenter", function () {
          var tip = this.getAttribute("data-tip");
          if (studioTooltipText && tip) {
            studioTooltipText.textContent = tip;
          }
        });
        el.addEventListener("mouseleave", function () {
          if (studioTooltipText) {
            studioTooltipText.textContent = "Hover over chart elements to inspect values";
          }
        });
      });
    }

    chartTabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = this.getAttribute("data-chart");
        setSpotlight(k, false);
      });
    });

    chartRows.forEach(function (row) {
      row.addEventListener("click", function () {
        var k = this.getAttribute("data-chart");
        setSpotlight(k, true);
      });
    });

    // Initialize with histogram
    setSpotlight("histogram", false);
  }

  /* ---------- Redesigned Statistical Taxonomy Interactive Features ---------- */
  var statTaxContainer = document.getElementById("statTaxonomyContainer");
  if (statTaxContainer) {
    // 1. Tab Switcher
    var taxTabs = statTaxContainer.querySelectorAll(".stat-tax-tab");
    var branchQuant = document.getElementById("branchQuant");
    var branchQual = document.getElementById("branchQual");

    taxTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var filter = this.getAttribute("data-tax-filter");

        taxTabs.forEach(function (t) {
          t.classList.remove("is-active");
          t.setAttribute("aria-selected", "false");
        });
        this.classList.add("is-active");
        this.setAttribute("aria-selected", "true");

        if (filter === "all") {
          if (branchQuant) branchQuant.classList.remove("is-hidden");
          if (branchQual) branchQual.classList.remove("is-hidden");
        } else if (filter === "quant") {
          if (branchQuant) branchQuant.classList.remove("is-hidden");
          if (branchQual) branchQual.classList.add("is-hidden");
        } else if (filter === "qual") {
          if (branchQuant) branchQuant.classList.add("is-hidden");
          if (branchQual) branchQual.classList.remove("is-hidden");
        }
      });
    });

    // 2. Discrete Counter Interactive Lab
    var discreteCount = 3;
    var discreteIncBtn = document.getElementById("discreteIncBtn");
    var discreteDecBtn = document.getElementById("discreteDecBtn");
    var discreteCountText = document.getElementById("discreteCountText");
    var discreteFeedback = document.getElementById("discreteFeedback");

    function updateDiscreteUI() {
      if (discreteCountText) discreteCountText.textContent = discreteCount + " item" + (discreteCount === 1 ? "" : "s");
      if (discreteFeedback) {
        discreteFeedback.innerHTML = "Notice: Discrete values jump in whole numbers (" + (discreteCount - 1) + ", " + discreteCount + ", " + (discreteCount + 1) + "). You cannot have <strong>" + discreteCount + ".4 items</strong>.";
      }
    }

    if (discreteIncBtn && discreteDecBtn) {
      discreteIncBtn.addEventListener("click", function () {
        if (discreteCount < 25) {
          discreteCount++;
          updateDiscreteUI();
        }
      });
      discreteDecBtn.addEventListener("click", function () {
        if (discreteCount > 1) {
          discreteCount--;
          updateDiscreteUI();
        }
      });
    }

    // 3. Continuous Slider Interactive Lab
    var continuousSlider = document.getElementById("continuousSlider");
    var continuousValText = document.getElementById("continuousValText");
    var continuousFeedback = document.getElementById("continuousFeedback");

    if (continuousSlider && continuousValText) {
      continuousSlider.addEventListener("input", function () {
        var num = parseFloat(this.value);
        var formatted = num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        continuousValText.textContent = "$" + formatted;
        if (continuousFeedback) {
          continuousFeedback.innerHTML = "Notice: Continuous values flow smoothly with infinite decimal points ($" + formatted + ").";
        }
      });
    }

    // 4. Nominal Category Pills Interactive Lab
    var nominalPillRow = document.getElementById("nominalPillRow");
    var nominalFeedback = document.getElementById("nominalFeedback");
    if (nominalPillRow) {
      var nomBtns = nominalPillRow.querySelectorAll(".lab-pill-btn");
      nomBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          nomBtns.forEach(function (b) { b.classList.remove("is-active"); });
          this.classList.add("is-active");
          var country = this.getAttribute("data-nominal");
          if (nominalFeedback) {
            nominalFeedback.innerHTML = "Selected: <strong>" + country + "</strong>. Country names are labels with no natural order. " + country + " is not 'greater' or 'less' than other countries.";
          }
        });
      });
    }

    // 5. Ordinal Ranking Pills Interactive Lab
    var ordinalPillRow = document.getElementById("ordinalPillRow");
    var ordinalFeedback = document.getElementById("ordinalFeedback");
    if (ordinalPillRow) {
      var ordBtns = ordinalPillRow.querySelectorAll(".lab-pill-btn");
      ordBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          ordBtns.forEach(function (b) { b.classList.remove("is-active"); });
          this.classList.add("is-active");
          var rank = this.getAttribute("data-ordinal");
          var note = "";
          if (rank === "Low") note = "Lowest tier in hierarchy (Low < Medium < High).";
          else if (rank === "Medium") note = "Intermediate tier in hierarchy (Low < Medium < High).";
          else note = "Highest tier in hierarchy (High > Medium > Low).";
          if (ordinalFeedback) {
            ordinalFeedback.innerHTML = "Selected: <strong>" + rank + "</strong>. Clear ranking: High > Medium > Low. " + note + " Rank order is preserved, but we cannot calculate mathematical distances like High minus Medium.";
          }
        });
      });
    }
  }

  /* =========================================================================
     Data Taxonomy to Preprocessing to ML Model Interactive Figure Handlers
     ========================================================================= */
  var pflowFigure = document.getElementById("dataTaxonomyFigure");
  if (pflowFigure) {
    var pflowCanvas = document.getElementById("pflowCanvas");
    var allNodes = pflowFigure.querySelectorAll(".pflow-node");

    // Inspector elements
    var inspIcon = document.getElementById("inspIcon");
    var inspEyebrow = document.getElementById("inspEyebrow");
    var inspTitle = document.getElementById("inspTitle");
    var inspTypeTag = document.getElementById("inspTypeTag");
    var inspRaw = document.getElementById("inspRaw");
    var inspRawNote = document.getElementById("inspRawNote");
    var inspFlaw = document.getElementById("inspFlaw");
    var inspFlawNote = document.getElementById("inspFlawNote");
    var inspFix = document.getElementById("inspFix");
    var inspFixNote = document.getElementById("inspFixNote");
    var inspTensor = document.getElementById("inspTensor");
    var predVal = document.getElementById("pflowPredVal");

    // Node Information Database
    var pflowData = {
      "data": {
        title: "Raw Ingested Data",
        eyebrow: "Root Source",
        tag: "Ingestion Stream",
        icon: "💾",
        raw: '["France", 44, 72000, NaN, "Purchased: Yes"]',
        rawNote: "Raw records as stored in databases, CSV files, sensors, or APIs.",
        flaw: "Contains missing NaNs, text labels, and wild differences in scale.",
        flawNote: "Algorithms perform vector arithmetic; multiplying weights by strings or NaNs causes instant execution failure.",
        fix: "Multi-stage preprocessing pipeline with Imputer, Encoders, and Scalers.",
        fixNote: "Cleans, encodes, scales, and structures all variables into numeric tensors X and y.",
        tensor: "X = [[1.0, 0.0, 0.0, 0.78, 1.24], ...], y = [1, 0, 1]"
      },
      "numerical": {
        title: "Numerical Data Category",
        eyebrow: "Quantitative Branch",
        tag: "Numbers & Quantities",
        icon: "📊",
        raw: "Age = 44, Salary = $72,000, Temperature = 37.2°C",
        rawNote: "Quantitative numbers measuring magnitude, scale, counts, or duration.",
        flaw: "Huge scale mismatch (e.g., Salary [$10k–$200k] dwarfs Age [18–80]).",
        flawNote: "Larger magnitude features completely overpower gradient descent and Euclidean distance calculations.",
        fix: "StandardScaler() or MinMaxScaler()",
        fixNote: "Standardizes columns to mean=0, std=1, giving every numerical feature equal weighting.",
        tensor: "X[:, 1:3] = [[0.82, 1.15], [-1.24, -0.76], [0.12, 0.34]]"
      },
      "categorical": {
        title: "Categorical Data Category",
        eyebrow: "Qualitative Branch",
        tag: "Labels & Groups",
        icon: "🏷️",
        raw: 'Country = ["France", "Spain", "Germany"], Status = ["Low", "High"]',
        rawNote: "Qualitative attributes representing groups, names, and discrete classes.",
        flaw: "ML models compute dot products W · x; you cannot multiply 0.45 × 'France'.",
        flawNote: "Matrix algebra requires numeric vectors; string inputs result in TypeError: cannot multiply sequence.",
        fix: "OneHotEncoder() for nominal categories; OrdinalEncoder() for ranked groups.",
        fixNote: "Translates text strings into binary indicator columns [1, 0, 0] or sequential integer rankings.",
        tensor: "X[:, 0:3] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]"
      },
      "other": {
        title: "Other Data Category",
        eyebrow: "Unstructured Branch",
        tag: "Text & Imagery",
        icon: "🖼️",
        raw: 'Reviews = "Great experience!", Image = [224, 224, 3] RGB pixels',
        rawNote: "High-dimensional perceptual data (natural language prose, photographic pictures, audio signals).",
        flaw: "Arbitrary variable length and raw pixel ranges (0–255) cause exploding gradients.",
        flawNote: "Cannot be passed directly into classical machine learning estimators without vectorization.",
        fix: "Tokenizers / Embeddings for text; Normalization (pixel / 255.0) for images.",
        fixNote: "Converts text sentences into dense semantic vectors and scales pixel tensors to [0.0, 1.0].",
        tensor: "X_embedded = [[0.14, -0.89, 0.45, ...]]"
      },
      "discrete": {
        title: "Discrete Numerical Data",
        eyebrow: "Subtype of Numerical",
        tag: "Whole Counts",
        icon: "🎲",
        raw: "Visits = 3, Cars = 2, Items = 5",
        rawNote: "Countable whole numbers that jump in discrete steps (1, 2, 3). Fractional items do not exist.",
        flaw: "Can contain missing values (NaN) or sentinel outlier codes (e.g. 999 for unknown).",
        flawNote: "Outliers pull regression lines; standard mean imputation can generate nonsensical fractional counts.",
        fix: "SimpleImputer(strategy='median') and integer scaling.",
        fixNote: "Median strategy preserves natural integer properties without outlier distortion.",
        tensor: "X[:, 1] = [3.0, 2.0, 5.0]"
      },
      "continuous": {
        title: "Continuous Numerical Data",
        eyebrow: "Subtype of Numerical",
        tag: "Infinite Continuum",
        icon: "📈",
        raw: "Salary = $72,000.50, Age = 44.5 yrs, Temperature = 36.6°C",
        rawNote: "Measurements along an uninterrupted continuous spectrum with infinite decimal precision.",
        flaw: "Unbounded numeric ranges cause loss surfaces to stretch into steep, elongated ravines.",
        flawNote: "Gradient descent oscillates erratically and takes much longer to converge without feature scaling.",
        fix: "StandardScaler(): z = (x - μ) / σ",
        fixNote: "Centers the distribution at 0 with standard deviation of 1 for fast, stable gradient descent.",
        tensor: "X[:, 2] = [1.24, -0.65, 0.42]"
      },
      "nominal": {
        title: "Nominal Categorical Data",
        eyebrow: "Subtype of Categorical",
        tag: "Unordered Names",
        icon: "📍",
        raw: 'Country = ["France", "Spain", "Germany", "France"]',
        rawNote: "Named categories with no natural ranking (France is neither 'greater' nor 'less' than Spain).",
        flaw: "Label encoding (0, 1, 2) induces false mathematical order: Germany (2) > France (0)!",
        flawNote: "The model mistakenly assumes linear distance relationships between completely unordered names.",
        fix: "OneHotEncoder(drop='first')",
        fixNote: "Creates orthogonal dummy binary indicator columns [1, 0] with zero false ordinal bias.",
        tensor: "X[:, 0:2] = [[1, 0], [0, 1], [0, 0], [1, 0]]"
      },
      "ordinal": {
        title: "Ordinal Categorical Data",
        eyebrow: "Subtype of Categorical",
        tag: "Ranked Order",
        icon: "🏆",
        raw: 'Status = ["Low", "Medium", "High", "Medium"]',
        rawNote: "Categories where relative rank matters (High > Medium > Low), but exact numeric step intervals are unknown.",
        flaw: "One-hot encoding destroys the valuable ranking relationship between tiers.",
        flawNote: "Treating ordinal categories as independent names discards natural progression data.",
        fix: "OrdinalEncoder(categories=[['Low', 'Medium', 'High']])",
        fixNote: "Encodes ranks into ordered integers (Low=0, Medium=1, High=2) preserving the natural hierarchy.",
        tensor: "X[:, 3] = [0.0, 1.0, 2.0, 1.0]"
      },
      "text": {
        title: "Text & Language Data",
        eyebrow: "Subtype of Other Data",
        tag: "NLP Strings",
        icon: "📄",
        raw: 'Review = "Fast delivery, highly recommend this store!"',
        rawNote: "Free-form human text strings, customer feedback, and documentation.",
        flaw: "Unstructured string format cannot be placed into standard numeric dot product formulas.",
        flawNote: "Arbitrary variable character length violates fixed matrix dimension requirements.",
        fix: "TF-IDF Vectorizer or Pre-trained Word Embeddings.",
        fixNote: "Converts vocabulary tokens into fixed-length numeric vectors representing semantic context.",
        tensor: "X_text = [[0.05, 0.32, 0.78, ...]]"
      },
      "images": {
        title: "Image & Visual Data",
        eyebrow: "Subtype of Other Data",
        tag: "Pixel Tensors",
        icon: "📸",
        raw: "Image = 224×224×3 RGB matrix of pixel brightness integers (0 to 255)",
        rawNote: "Grid of sensor-recorded pixel colors across Red, Green, and Blue color channels.",
        flaw: "Integer pixel values (0–255) cause exploding weights; differing image sizes mismatch matrix shapes.",
        flawNote: "Algorithms require fixed tensor dimensions and normalized inputs to prevent gradient saturation.",
        fix: "Resizing to uniform dimensions + Pixel Normalization (pixels / 255.0).",
        fixNote: "Scales all pixel values into normalized floating-point numbers in the [0.0, 1.0] range.",
        tensor: "X_img = [[[0.84, 0.12, 0.35], ...]]"
      },
      "preprocessing": {
        title: "Data Preprocessing Hub",
        eyebrow: "The Mandatory Bridge",
        tag: "Transformation Engine",
        icon: "⚙️",
        raw: "Ingests all raw sources: NaNs, Strings, Text, Pixels, Mixed scales",
        rawNote: "The central pipeline where Scikit-Learn transformers clean and prepare dataset columns.",
        flaw: "Without preprocessing, 100% of machine learning models fail with errors or produce skewed models.",
        flawNote: "Every data flaw (missing values, categorical strings, disparate scales) is resolved here.",
        fix: "ColumnTransformer(transformers=[imputer, encoder, scaler])",
        fixNote: "Fits on training data and transforms test data into clean, formatted numerical tensors.",
        tensor: "X_train.shape = (8, 5), y_train.shape = (8,)"
      },
      "model": {
        title: "Machine Learning Model",
        eyebrow: "Target Learner",
        tag: "Mathematical Core",
        icon: "🧠",
        raw: "Ingests: Pure numerical matrix X and target vector y",
        rawNote: "Estimators like Logistic Regression, Random Forest, SVM, or Neural Networks.",
        flaw: "Machine learning algorithms strictly calculate vector dot products W · x + b.",
        flawNote: "They succeed only because Data Preprocessing provided pristine numerical tensors.",
        fix: "model.fit(X_train, y_train) &bull; model.predict(X_test)",
        fixNote: "Computes optimal weight vectors W that minimize predictive loss and generalize to new data.",
        tensor: "ŷ = [1, 0, 1, 1, 0] (Prediction: Purchased = Yes)"
      }
    };

    // Update Inspector display
    function updateInspector(nodeKey) {
      var info = pflowData[nodeKey] || pflowData["data"];
      if (inspIcon) inspIcon.textContent = info.icon;
      if (inspEyebrow) inspEyebrow.textContent = info.eyebrow;
      if (inspTitle) inspTitle.textContent = info.title;
      if (inspTypeTag) inspTypeTag.textContent = info.tag;
      if (inspRaw) inspRaw.innerHTML = "<code>" + info.raw + "</code>";
      if (inspRawNote) inspRawNote.textContent = info.rawNote;
      if (inspFlaw) inspFlaw.textContent = info.flaw;
      if (inspFlawNote) inspFlawNote.textContent = info.flawNote;
      if (inspFix) inspFix.innerHTML = "<code>" + info.fix + "</code>";
      if (inspFixNote) inspFixNote.textContent = info.fixNote;
      if (inspTensor) inspTensor.textContent = info.tensor;
    }

    // Highlight node on click / focus
    allNodes.forEach(function (node) {
      node.addEventListener("click", function () {
        var nodeKey = this.getAttribute("data-node");
        allNodes.forEach(function (n) { n.classList.remove("is-path-highlighted"); });
        this.classList.add("is-path-highlighted");
        updateInspector(nodeKey);
      });

      node.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Default inspection: show root
    updateInspector("data");
  }

  /* ---------- Important Facts: Split Ratio Visualizer Interactivity ---------- */
  var split8020Btn = document.getElementById("split8020Btn");
  var split7030Btn = document.getElementById("split7030Btn");
  var splitTrainBar = document.getElementById("splitTrainBar");
  var splitTestBar = document.getElementById("splitTestBar");
  var splitTrainPct = document.getElementById("splitTrainPct");
  var splitTestPct = document.getElementById("splitTestPct");
  var splitTrainInfo = document.getElementById("splitTrainInfo");
  var splitTestInfo = document.getElementById("splitTestInfo");

  if (split8020Btn && split7030Btn && splitTrainBar && splitTestBar) {
    split8020Btn.addEventListener("click", function () {
      split8020Btn.classList.add("is-active");
      split7030Btn.classList.remove("is-active");
      splitTrainBar.style.width = "80%";
      splitTestBar.style.width = "20%";
      if (splitTrainPct) splitTrainPct.textContent = "80% Training";
      if (splitTestPct) splitTestPct.textContent = "20% Testing";
      if (splitTrainInfo) splitTrainInfo.textContent = "✓ 8 of 10 samples for learning patterns";
      if (splitTestInfo) splitTestInfo.textContent = "🔒 2 of 10 samples held out for testing";
    });

    split7030Btn.addEventListener("click", function () {
      split7030Btn.classList.add("is-active");
      split8020Btn.classList.remove("is-active");
      splitTrainBar.style.width = "70%";
      splitTestBar.style.width = "30%";
      if (splitTrainPct) splitTrainPct.textContent = "70% Training";
      if (splitTestPct) splitTestPct.textContent = "30% Testing";
      if (splitTrainInfo) splitTrainInfo.textContent = "✓ 7 of 10 samples for learning patterns";
      if (splitTestInfo) splitTestInfo.textContent = "🔒 3 of 10 samples held out for testing";
    });
  }

  /* ---------- Lesson 4: Supervised Learning Classification Lab ---------- */
  var simHoursSlider = document.getElementById("simHoursSlider");
  var simHoursVal = document.getElementById("simHoursVal");
  var simAttSlider = document.getElementById("simAttSlider");
  var simAttVal = document.getElementById("simAttVal");
  var simLiveVector = document.getElementById("simLiveVector");
  var simBadge = document.getElementById("simBadge");
  var simBadgeText = document.getElementById("simBadgeText");
  var simExplanation = document.getElementById("simExplanation");
  var simBoundaryDot = document.getElementById("simBoundaryDot");

  function updateClassificationSimulator() {
    if (!simHoursSlider || !simAttSlider) return;
    var hours = parseFloat(simHoursSlider.value);
    var att = parseFloat(simAttSlider.value);

    if (simHoursVal) simHoursVal.textContent = hours + (hours === 1 ? " hr" : " hrs");
    if (simAttVal) simAttVal.textContent = att + "%";
    if (simLiveVector) simLiveVector.textContent = "X = [21, " + hours + ", " + att + "]";

    // Linear classification decision boundary:
    // Decision formula: (hours * 10) + (att * 0.8) >= 105
    var decisionScore = (hours * 10) + (att * 0.8);
    var isPass = decisionScore >= 105;

    if (simBadge) {
      simBadge.classList.toggle("sl-sim-badge--pass", isPass);
      simBadge.classList.toggle("sl-sim-badge--fail", !isPass);
    }
    if (simBadgeText) {
      simBadgeText.textContent = isPass ? "Class Label: Pass" : "Class Label: Fail";
    }
    if (simExplanation) {
      if (isPass) {
        simExplanation.innerHTML = "With <strong>" + hours + " study hrs</strong> and <strong>" + att + "% attendance</strong>, the classifier places this student above the decision boundary (&ge; 105 boundary score) &rarr; Predicted: <strong>Pass</strong>.";
      } else {
        simExplanation.innerHTML = "With <strong>" + hours + " study hrs</strong> and <strong>" + att + "% attendance</strong>, the classifier places this student below the decision boundary (&lt; 105 boundary score) &rarr; Predicted: <strong>Fail</strong>.";
      }
    }
    if (simBoundaryDot) {
      // Map hours (1..10) to SVG coordinate X (30..250), Attendance (40..100) to SVG coordinate Y (170..30)
      var posX = 30 + ((hours - 1) / 9) * 220;
      var posY = 170 - ((att - 40) / 60) * 140;
      simBoundaryDot.setAttribute("cx", posX.toFixed(1));
      simBoundaryDot.setAttribute("cy", posY.toFixed(1));
      simBoundaryDot.setAttribute("fill", isPass ? "#0EA894" : "#FF5A3C");
    }
  }

  if (simHoursSlider && simAttSlider) {
    simHoursSlider.addEventListener("input", updateClassificationSimulator);
    simAttSlider.addEventListener("input", updateClassificationSimulator);
    updateClassificationSimulator();
  }

  /* ---------- Lesson 4: ID3 Interactive Dataset Column Highlighting ---------- */
  (function initID3Module() {
    var table = document.getElementById("id3DataTable");
    var outlookCard = document.getElementById("id3CardOutlook");
    var tempCard = document.getElementById("id3CardTemp");
    var humidityCard = document.getElementById("id3CardHumidity");
    var windCard = document.getElementById("id3CardWind");

    if (!table) return;

    var allColumns = ["outlook", "temp", "humidity", "wind"];
    var cardsMap = {
      outlook: outlookCard,
      temp: tempCard,
      humidity: humidityCard,
      wind: windCard
    };
    var activeCol = null;

    function highlightColumn(colName) {
      if (activeCol === colName) {
        colName = null; // Toggle off if clicked again
      }
      activeCol = colName;

      allColumns.forEach(function (c) {
        var th = table.querySelector(".col-" + c);
        var tds = table.querySelectorAll(".col-" + c);
        var isActive = colName === c;
        if (th) th.classList.toggle("col-active", isActive);
        tds.forEach(function (td) {
          td.classList.toggle("col-active", isActive);
        });

        var card = cardsMap[c];
        if (card) {
          if (isActive) {
            card.style.borderColor = "var(--coral)";
            card.style.boxShadow = "0 8px 30px rgba(255, 90, 60, 0.2)";
          } else {
            card.style.borderColor = "";
            card.style.boxShadow = "";
          }
        }
      });

      if (colName && cardsMap[colName]) {
        cardsMap[colName].scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    var colHeaders = table.querySelectorAll(".id3-col-th");
    colHeaders.forEach(function (th) {
      th.style.cursor = "pointer";
      th.setAttribute("title", "Click to highlight and jump to this attribute's calculation");
      th.addEventListener("click", function () {
        var col = th.getAttribute("data-col");
        if (col) highlightColumn(col);
      });
    });
  })();
})();

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
    }
  };

  // Aliases mapping (including requested spellings / common typos)
  var TERM_ALIASES = {
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




