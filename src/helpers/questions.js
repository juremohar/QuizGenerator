function generateTrueFalseQuestions(category, numberOfQuestions) {
    let trueFalseQuestions = require('../../data/ves_neves.json').filter(q => q.ages.includes(category));
    let historyQuestions = require('../../data/zgodovina.json').filter(q => q.ages.includes(category));

    let questions = [...trueFalseQuestions, ...historyQuestions];
    let list = questions.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);

    return list.map(q => {
        let pickCorrect = Math.random() < 0.5;
        let randomAnswer = q.correctAnswer;
        if (!pickCorrect) {
            randomAnswer = q.wrongAnswers.sort(function() {return 0.5 - Math.random()})[0];
        }

        return {
            question: q.question,
            correctAnswer: q.correctAnswer,
            randomAnswer: randomAnswer,
            userAnswer: null
        }
    });
}

function generateMultipleChoiceQuestions(category, field, numberOfQuestions) {
    let questions = require(`../../data/${field}.json`).filter(q => q.ages.includes(category));;
    let list = questions.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);

    return list.map(q => {
        let answers = q.wrongAnswers.sort(function() {return 0.5 - Math.random()}).slice(0, 2);
        answers.push(q.correctAnswer)

        return {
            question: q.question,
            answers: answers.sort(function() {return 0.5 - Math.random()}),
            correctAnswer: q.correctAnswer,
            userAnswer: null
        }
    });
}


export { 
    generateTrueFalseQuestions,
    generateMultipleChoiceQuestions
}