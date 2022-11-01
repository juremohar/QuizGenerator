function isAnswerSelected(userAnswer, trueFalse) {
    if (userAnswer === trueFalse) {
        return "active";
    }

    return "";
}

function isUserAnswerCorrect(userAnswer, correctAnswers, randomAnswer) {
    let wasShownAnswerCorrect = correctAnswers === randomAnswer;

    return wasShownAnswerCorrect === userAnswer;
}


let ShowCorrectAnswers = {
    view: function(vnode) {
        let properties = vnode.attrs;
        if (isUserAnswerCorrect(properties.userAnswer, properties.correctAnswers, properties.randomAnswer)) {
            return <CorrectAnswers />
        }

        return <WrongAnswer correctAnswers={properties.correctAnswers} />
    }
}

let WrongAnswer = {
    view: function(vnode) {
        return <div className="callout callout-default mt-2">
            <div className="badge bg-danger mb-1">
                <i class="bi bi-x-circle"></i> Napačen odgovor!
            </div>
            <div className="correct-answer">
                { vnode.attrs.correctAnswers }
            </div>
        </div>
    }
}

let CorrectAnswers = {
    view: function() {
        return <div className="badge bg-success mt-2">
            <i class="bi bi-check-circle"></i> Pravilen odgovor!
        </div>
    }
}

var MultipleOptionsComponent = {
    view: function(vnode) {
        let properties = vnode.attrs
        return <div className="py-2">
            <div className="mb-1 fw-bold">
                { properties.questionNumber + 1 }. { properties.question }
            </div>
            <div className="random-answer">
                { properties.randomAnswer }
            </div>
            <div className="mt-2 true-false-buttons">
                <button 
                    type="button" 
                    className={`btn btn-outline-dark btn-sm me-2 ${ isAnswerSelected(properties.userAnswer, true) }`}
                    onclick={() => properties.onAnswerSelection(properties.question, true) }
                >Drži</button>
                <button
                    type="button" 
                    className={`btn btn-outline-dark btn-sm ${ isAnswerSelected(properties.userAnswer, false) }`}
                    onclick={() => properties.onAnswerSelection(properties.question, false) }
                >Ne drži</button>
            </div>
            <div>
                { 
                    properties.showTrueFalseQuestionsResult && <ShowCorrectAnswers userAnswer={properties.userAnswer} correctAnswers={properties.correctAnswers} randomAnswer={properties.randomAnswer} />
                }
            </div>
        </div>
    }
}

export { MultipleOptionsComponent }
