const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')
const { Octokit } = require("@octokit/rest")

const GIT_REPO_OWNER = 'anandsathe67'
const GIT_REPO = 'GithubIssuesImport'
const PERSONAL_ACCESS_TOKEN = '9f3c726967fd547c2892921b4e1fd41017d26ac6'

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
const userMap = { 'Adam Galper': 'agalper', 'Anand Sathe': 'anandsathe67' }

const filePath = path.join(__dirname, 'test2.csv')

fs.readFile(filePath, async (error, data) => {
    if (error) {
        return console.log('error reading file')
    }
    const parsedData = await neatCsv(data)

    console.log(parsedData)

    const milestones = Array.from(new Set(parsedData.map(csvIssue => {
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

    for (const csvIssue of parsedData) {
        const issue = await createIssue(csvIssue,
            milestoneMap.get(csvIssue.Status),
            ['anandsathe67']) //[userMap.get(csvIssue['Assigned to'])])

        console.log("Issue created:" + issue)
        console.log("Issue Number: " + issue.data.number)
        if(csvIssue['Progress Comments']) {
            const commentCreate = await octokit.issues.createComment({
                owner: GIT_REPO_OWNER,
                repo: GIT_REPO,
                issue_number: issue.data.number,
                body: csvIssue['Progress Comments']
            })
            console.log(commentCreate)
        }

    }
})

async function createMilestone(title) {
    const milestoneData = await octokit.issues.createMilestone({
        owner: GIT_REPO_OWNER,
        repo: GIT_REPO,
        title: title

    })
    console.log("MilestoneData Number = " + milestoneData.data.number)
    return milestoneData
}

async function createIssue(csvIssue, milestoneId, assignees) {
    let labels = []
    if (csvIssue.Priority) {
        labels.push('Priority:' + csvIssue.Priority)
    }
    if (csvIssue['Issue Type']) {
        labels.push(csvIssue['Issue Type'])
    }
    const issue = await octokit.issues.create({
        owner: GIT_REPO_OWNER,
        repo: GIT_REPO,
        title: csvIssue.Name,
        body: csvIssue.Description,
        assignees: assignees,//[userMap[csvIssue['Assigned to']]]
        milestone: milestoneId,
        labels: labels
    })
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