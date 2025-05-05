
document.getElementById("analyze-btn").addEventListener("click", async () => {
    const jobDesc = document.getElementById("job-desc").value;
    const mandatorySkills = document.getElementById("mandatory-skills").value.split(",").map(skill => skill.trim());
    const goodSkills = document.getElementById("good-skills").value.split(",").map(skill => skill.trim());
    const experience = document.getElementById("experience").value;
    const files = document.getElementById("resume-upload").files;

    if (!jobDesc || !mandatorySkills.length || !experience || files.length === 0) {
        alert("Please fill out all fields and upload at least one resume.");
        return;
    }

    const results = [];

    for (const file of files) {
        const resumeText = await parseResume(file);
        await new Promise(resolve => setTimeout(resolve, 1500)); // delay to prevent rate limit
        const analysis = await analyzeResume(jobDesc, mandatorySkills, goodSkills, experience, resumeText);
        results.push({ name: file.name, ...analysis });
    }

    displayResults(results);
});

async function parseResume(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

async function analyzeResume(jobDesc, mandatorySkills, goodSkills, experience, resumeText) {
    const response = await fetch("https://resume-analyzer-backend-z2jg.onrender.com/analyze", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    jobDescription,
    mandatorySkills,
    goodToHaveSkills,
    requiredExperience,
    resumeText,
  }),
});

    const data = await response.json();
    return {
        matchPercentage: data.matchPercentage,
        justification: data.justification,
    };
}

function displayResults(results) {
    const tableBody = document.querySelector("#results-table tbody");
    tableBody.innerHTML = "";

    results.sort((a, b) => b.matchPercentage - a.matchPercentage).forEach((result, index) => {
        const row = `<tr>
            <td>${result.name}</td>
            <td>${result.matchPercentage}%</td>
            <td>${index + 1}</td>
            <td>${result.justification}</td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}
