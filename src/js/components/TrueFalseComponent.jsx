function isAnswerSelected(userAnswer, trueFalse) {
    if (userAnswer === trueFalse) {
        return "active";
    }

    return "";
}

function isUserAnswerCorrect(userAnswer, correctAnswer, randomAnswer) {
    let wasShownAnswerCorrect = correctAnswer === randomAnswer;

    return wasShownAnswerCorrect === userAnswer;
}


let ShowCorrectAnswers = {
    view: function(vnode) {
        let properties = vnode.attrs;
        if (isUserAnswerCorrect(properties.userAnswer, properties.correctAnswer, properties.randomAnswer)) {
            return <CorrectAnswers />
        }

        return <WrongAnswer correctAnswer={properties.correctAnswer} />
    }
}

let WrongAnswer = {
    view: function(vnode) {
        return <div className="callout callout-default mt-2">
            <div className="badge bg-danger mb-1">
                <i class="bi bi-x-circle"></i> Napačen odgovor!
            </div>
            <div className="correct-answer">
                { vnode.attrs.correctAnswer }
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

let Image = {
    source: null,
    oninit: function(vnode) {
        this.source = require(`../../assets/images/vescine/${vnode.attrs.source}`)
    },
    view: function() {
        return <img src={this.source} className="img-thumbnail mb-1" />
    }
}

var TrueFalseComponent = {
    view: function(vnode) {
        let properties = vnode.attrs
        return <div className="py-2">
            <div className="mb-1 fw-bold">
                { properties.questionNumber + 1 }. { properties.question }
            </div>
            {
                properties.source && <Image source={properties.source} />
            }
            <div className="random-answer">
                { properties.randomAnswer }
            </div>
            <div className="mt-2 true-false-buttons">
                <button 
                    type="button" 
                    className={`btn btn-outline-dark btn-sm me-2 ${ isAnswerSelected(properties.userAnswer, true) }`}
                    onclick={() => properties.onAnswerSelection(properties.questionNumber, true) }
                >Drži</button>
                <button
                    type="button" 
                    className={`btn btn-outline-dark btn-sm ${ isAnswerSelected(properties.userAnswer, false) }`}
                    onclick={() => properties.onAnswerSelection(properties.questionNumber, false) }
                >Ne drži</button>
            </div>
            <div>
                { 
                    properties.showResults && <ShowCorrectAnswers userAnswer={properties.userAnswer} correctAnswer={properties.correctAnswer} randomAnswer={properties.randomAnswer} />
                }
            </div>
        </div>
    }
}

export { TrueFalseComponent }
