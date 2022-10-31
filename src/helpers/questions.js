function generateTrueFalseQuestions(category, numberOfQuestions) {
    let questions = require('../../data/ves_neves.json').filter(q => q.ages.includes(category));;
    let list = questions.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);

    return list.map(q => {
        let pickCorrect = Math.random() < 0.5;
        let randomAnswear = q.correctAnswear;
        if (!pickCorrect) {
            randomAnswear = q.wrongAnswears.sort(function() {return 0.5 - Math.random()})[0];
        }

        return {
            question: q.question,
            correctAnswear: q.correctAnswear,
            randomAnswear: randomAnswear,
            userAnswear: null
        }
    });
}


export { generateTrueFalseQuestions }