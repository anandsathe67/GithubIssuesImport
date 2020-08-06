/**
 * Script to create labels based on unique values in the columns
 * Priority, Status and Issue Type
 */
const GIT_REPO_OWNER = 'anandsathe67'
const GIT_REPO = 'GithubIssuesImport'
const PERSONAL_ACCESS_TOKEN = '62954646624f53f4f0622531f78d01f5c9c046d5'
const CSV_FILE_NAME = 'issues.csv'

// Just using strings without context gets confusing when an issue is tagged with a number of labels
// The prefixes give some context to the label
const PRIORITY_PREFIX = "Priority:"
const STATUS_PREFIX = "Status:"
const ISSUE_TYPE_PREFIX = "Issue Type:"

const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')
const { Octokit } = require("@octokit/rest")
const octokit = new Octokit({
    auth: PERSONAL_ACCESS_TOKEN,
    userAgent: 'Cheaseed Prototype 1.0',
    timeZone: 'America/Los_Angeles',
    log: require("console-log-level")({ level: "info" }),
    request: {
        agent: undefined,
        fetch: undefined,
        timeout: 0
    }
})

//const colorMap = {"Red": "b60205", "Blue": "1d76db", "Yellow": "fbca04", "Green": "0e8a16", "Purple": "5319e7",
//"LightBlue": "bfd4f2", "Pink": "e99695", "DarkBlue": "0052cc", "Cyan": "f9d0c4", "LightGreen": "c2e0c6", 
//"LightPurple": "d4c5f9", "BrightRed": "d93f0b"
//}
const colorMap = {
    "Critical": "b60205", "High": "1d76db", "Normal": "fbca04", "Low": "0e8a16",
    "New Feature": "5319e7", "Functional Bug": "bfd4f2", "UI Fix": "e99695", "Content Fix": "0052cc",
    "Unsure": "f9d0c4", "Build Issue": "c2e0c6", "Nit": "d4c5f9",
    "In progress": "1d76db", "Ready for Review (on dev)": "c2e0c6", "New": "d93f0b", "Ready for Push": "0e8a16"
}

const filePath = path.join(__dirname, CSV_FILE_NAME)

fs.readFile(filePath, async (error, data) => {
    if (error) {
        return console.log('error reading file')
    }
    const parsedData = await neatCsv(data)
    //console.log("CSV = " + JSON.stringify(parsedData))

    const priorities = Array.from(
        new Set(parsedData.map(csvIssue => {
            return csvIssue.Priority
        }))
    ).filter(Boolean)
    
    priorityMap = new Map()
    priorities.forEach(function (priority) {
        priorityMap.set(PRIORITY_PREFIX + priority, colorMap[priority])
    })

    const issueTypes = Array.from(
        new Set(parsedData.map(csvIssue => {
            return csvIssue['Issue Type']
        }))
    ).filter(Boolean)

    issueTypesMap = new Map()
    issueTypes.forEach(function (issueType) {
        issueTypesMap.set(ISSUE_TYPE_PREFIX + issueType, colorMap[issueType])
    })

    for (let [key, value] of issueTypesMap) {
        console.log(key + ' = ' + value)
    }

    const statuses = Array.from(
        new Set(parsedData.map(csvIssue => {
            return csvIssue.Status
        }))
    ).filter(Boolean)

    statusMap = new Map()
    statuses.forEach(function (status) {
        statusMap.set(STATUS_PREFIX + status, colorMap[status])
    })

    for (let [key, value] of statusMap) {
        console.log(key + ' = ' + value)
    }
    //const ranks = new Set(parsedData.map(csvIssue => {
    //    return "Rank:" + csvIssue.Rank
    //})) 

    //console.log("Parsed Data = " + JSON.stringify(parsedData))
    console.log("Generating labels for the priority column")
    priorityMap.forEach(async function (color, label) {
        const data = await octokit.issues.createLabel({
            owner: GIT_REPO_OWNER,
            repo: GIT_REPO,
            name: label,
            color: color,
            description: "Priority"

        })
        console.log("Response for Priority Label creation:" + JSON.stringify(data))
    })

    console.log("Generating labels for the Issue Type column")
    issueTypesMap.forEach(async function (color, label) {
        const data = await octokit.issues.createLabel({
            owner: GIT_REPO_OWNER,
            repo: GIT_REPO,
            name: label,
            color: color,
            description: "Issue Type"

        })
        console.log("Response for Issue Type Label creation:" + JSON.stringify(data))
    })

    console.log("Generating labels for the Status column")
    statusMap.forEach(async function (color, label) {
        const data = await octokit.issues.createLabel({
            owner: GIT_REPO_OWNER,
            repo: GIT_REPO,
            name: label,
            color: color,
            description: "Status"

        })
        console.log("Response for Status Label creation:" + JSON.stringify(data))
    })

    //const allLabelsMap = new Map([...priorityMap, ...issueTypesMap, ...statusMap])
    /*for (let [key, value] of allLabelsMap) {
       console.log(key + ' = ' + value)
   } */
    /*allLabelsMap.forEach(async function (color, label) {
        const data = await octokit.issues.createLabel({
            owner: GIT_REPO_OWNER,
            repo: GIT_REPO,
            name: label,
            color: color

        })
        console.log(data)
    }) */
})
