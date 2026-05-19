const fetch = require('node-fetch');

const query = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      data {
        frontendQuestionId: questionFrontendId
        title
        titleSlug
        difficulty
        topicTags {
          name
        }
      }
    }
  }
`;

async function fetchQuestions() {
  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        categorySlug: "",
        skip: 0,
        limit: 5,
        filters: {}
      }
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

fetchQuestions();
