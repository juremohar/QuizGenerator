function generateTrueFalseQuestions(category, fields, numberOfQuestions) {
    let allQuestions = [];

    fields.forEach(field => {
        let fieldQuestions = require(`../../data/${field}.json`).filter(q => q.ages.includes(category));
        allQuestions.push(...fieldQuestions);
    });

    let list = allQuestions.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);

    return list.map(q => {
        let pickCorrect = Math.random() < 0.5;
        let randomAnswer = q.correctAnswer;
        if (!pickCorrect) {
            randomAnswer = q.wrongAnswers.sort(function() {return 0.5 - Math.random()})[0];
        }

        return {
            question: q.question,
            correctAnswer: q.correctAnswer,
            source: q.source ?? null,
            randomAnswer: randomAnswer,
            userAnswer: null
        }
    });
}

function generateMultipleChoiceQuestions(category, fields, numberOfQuestions) {
    let allQuestions = [];

    fields.forEach(field => {
        let fieldQuestions = require(`../../data/${field}.json`).filter(q => q.ages.includes(category));
        allQuestions.push(...fieldQuestions);
    });

    let list = allQuestions.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);

    return list.map(q => {
        let answers = q.wrongAnswers.sort(function() {return 0.5 - Math.random()}).slice(0, 2);
        answers.push(q.correctAnswer)

        return {
            question: q.question,
            correctAnswer: q.correctAnswer,
            source: q.source ?? null,
            answers: answers.sort(function() {return 0.5 - Math.random()}),
            userAnswer: null
        }
    });
}


export { 
    generateTrueFalseQuestions,
    generateMultipleChoiceQuestions
}