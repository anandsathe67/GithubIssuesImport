/**
 * Script to import a CSV file and create Github issues. title, description
 * and comments are mapped to the respective git issue entities. Status, Priority
 * and Issue Type are modeled as labels
 */
const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')
const { Octokit } = require("@octokit/rest")

const GIT_REPO_OWNER = 'cheaseed'
const GIT_REPO = 'cheaseed-prototype'
//set the token value below before running the script
const PERSONAL_ACCESS_TOKEN = 'xxx'
const CSV_FILE_NAME = 'issues-Completed Issues Remaining.csv'
// Just using strings without context gets confusing when an issue is tagged with a number of labels
// The prefixes give some context to the label
const PRIORITY_PREFIX = "Priority:"
const STATUS_PREFIX = "Status:"
const ISSUE_TYPE_PREFIX = "Issue Type:"

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
// Map names to github users. TODO - look up based on full name and org
// for example octakit.search.users({q='fullname:Anand Sathe+org:Cheaseed'})
const userMap = new Map([
    ['Adam Galper', 'agalper'], 
    ['Anand Sathe', 'anandsathe67'],
    ['Nicole Johnson', 'johnsonnicole'],
    ['Giselle Galper', 'gsgalper']
])

const filePath = path.join(__dirname, CSV_FILE_NAME)

fs.readFile(filePath, async (error, data) => {
    if (error) {
        return console.log('error reading file')
    }
    const parsedData = await neatCsv(data)

    console.log("CSV File Data:" + JSON.stringify(parsedData))

   /* const milestones = Array.from(new Set(parsedData.map(csvIssue => {
        return csvIssue.Status
    }).filter(function (val) { return val != null && val != "" })))

    console.log("Milestones = " + milestones)

    milestoneMap = new Map()
    for (const milestone of milestones) {
        const response = await createMilestone(milestone)
        milestoneMap.set(response.data.title, response.data.number)
    }
    console.log("Milestone Map: ")
    for (let [key, value] of milestoneMap) {

        console.log(key + ' = ' + value)
    }
*/
    for (const csvIssue of parsedData) {
        const githubUsers = csvIssue['Assigned to'].split(',').map(name => {
            return userMap.get(name)
        }).filter(Boolean)

        console.log("Github Users = " + JSON.stringify(githubUsers))
        const issue = await createIssue(csvIssue,
            //milestoneMap.get(csvIssue.Status),
            githubUsers)

        console.log("Issue created:" + JSON.stringify(issue))
        //console.log("Issue Number: " + issue.data.number)
        if(csvIssue['Progress Comments']) {
            const commentCreate = await octokit.issues.createComment({
                owner: GIT_REPO_OWNER,
                repo: GIT_REPO,
                issue_number: issue.data.number,
                body: csvIssue['Progress Comments']
            })
            console.log("Comment Created:" + JSON.stringify(commentCreate))
        }
        if(csvIssue.Attachments) {
            const commentCreate = await octokit.issues.createComment({
                owner: GIT_REPO_OWNER,
                repo: GIT_REPO,
                issue_number: issue.data.number,
                body: ("Attachments: \n" + csvIssue.Attachments.replace(/,/g, ', '))
            })
            console.log("Comment Created:" + JSON.stringify(commentCreate))
        }
        if(csvIssue['Closed'] == "1") {
            const commentCreate = await octokit.issues.createComment({
                owner: GIT_REPO_OWNER,
                repo: GIT_REPO,
                issue_number: issue.data.number,
                body: ("Date Completed:" + csvIssue['Date Completed'])
            })
            console.log("Comment Created:" + JSON.stringify(commentCreate))
        }

    }
})

async function createMilestone(title) {
    const milestoneData = await octokit.issues.createMilestone({
        owner: GIT_REPO_OWNER,
        repo: GIT_REPO,
        title: title
    })
    //console.log("MilestoneData Number = " + milestoneData.data.number)
    return milestoneData
}

async function createIssue(csvIssue, /*milestoneId,*/ assignees) {
    let labels = []
    if (csvIssue.Priority) {
        labels.push(PRIORITY_PREFIX + csvIssue.Priority)
    }
    if (csvIssue['Issue Type']) {
        labels.push(ISSUE_TYPE_PREFIX + csvIssue['Issue Type'])
    }
    if (csvIssue.Status) {
        labels.push(STATUS_PREFIX + csvIssue.Status)
    }
    let issue = await octokit.issues.create({
        owner: GIT_REPO_OWNER,
        repo: GIT_REPO,
        title: csvIssue.Name,
        body: csvIssue.Description,
        assignees: assignees,
        //milestone: milestoneId,
        labels: labels
    })
    if(csvIssue['Closed'] == "1") {
        issue = await octokit.issues.update({
            owner: GIT_REPO_OWNER,
            repo: GIT_REPO,
            issue_number: issue.data.number,
            state: "closed"
        })
    }
    return issue
}

async function createComment(issueNumber, comment) {
    const commentResponse = await octokit.issues.createComment({
        owner: GIT_REPO_OWNER,
        repo: GIT_REPO,
        issue_number: issueNumber,
        body: comment
    })
    return commentResponse
}