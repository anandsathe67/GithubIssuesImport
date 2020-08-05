const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')
const { Octokit } = require("@octokit/rest")
const octokit = new Octokit({
    auth: "9f3c726967fd547c2892921b4e1fd41017d26ac6",
    userAgent: 'Cheaseed Prototype 1.0',
    timeZone: 'America/Los_Angeles',
    log: require("console-log-level")({ level: "info" }),
    request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0
    }
})

const filePath = path.join(__dirname, 'issues.csv')

fs.readFile(filePath, async (error, data) => {
    if (error) {
        return console.log('error reading file')
    }
    const parsedData = await neatCsv(data)
    const milestones = Array.from(new Set(parsedData.map(csvIssue => {
        return csvIssue.Status
    }).filter(function(val) { return val != null && val != ""})))

    console.log("Milestones = " + milestones)
    //console.log("Parsed Data = " + JSON.stringify(parsedData))
    milestones.forEach(async function (title) {
        const data = await octokit.issues.createMilestone({
            owner: 'anandsathe67',
            repo: 'GithubIssuesImport',
            title: title

        })
        console.log(data)
    })
})
