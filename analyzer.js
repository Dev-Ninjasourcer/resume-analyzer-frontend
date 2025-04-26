document.getElementById("analyze-btn").addEventListener("click", async () => {
  async function sendAnalyzeRequest() {
    const jdLink = document.getElementById("jd-link").value;
    const jobDescManual = document.getElementById("job-desc").value;
    const mandatorySkills = document.getElementById("mandatory-skills").value;
    const goodSkills = document.getElementById("good-skills").value;
    const experience = document.getElementById("experience").value;
    const files = document.getElementById("resume-upload").files;

    const formData = new FormData();
    formData.append("jobDescription", jobDescManual);
    formData.append("jdLink", jdLink);
    formData.append("mandatorySkills", mandatorySkills);
    formData.append("goodToHaveSkills", goodSkills);
    formData.append("requiredExperience", experience);

    for (const file of files) {
      formData.append("resumes", file);
    }

    try {
      const response = await fetch("https://resume-analyzer-backend-z2jg.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("❌ Server responded with status: " + response.status);
        console.error("Server response error", response);
        return;
      }

      const results = await response.json();
      console.log("✅ Backend response:", results);

      const tbody = document.querySelector("#results-table tbody");
      tbody.innerHTML = "";

      results.forEach((result) => {
        const row = `<tr>
          <td>${result.candidate}</td>
          <td>${result.matchPercentage}%</td>
          <td>${result.justification}</td>
        </tr>`;
        tbody.innerHTML += row;
      });

      if (results.length > 0 && results[0].justification.includes("rate limit")) {
        console.warn("⚠️ Rate limit hit. Retrying after 10 seconds...");
        alert("⚠️ Rate limit exceeded. Retrying automatically after 10 seconds...");
        setTimeout(() => {
          sendAnalyzeRequest(); // Retry once after 10 seconds
        }, 10000);
      } else {
        alert("✅ Results loaded. Check table below.");
      }

    } catch (error) {
      alert("❌ Failed to fetch results. See console.");
      console.error("❌ Fetch error:", error);
    }
  }

  sendAnalyzeRequest();
});