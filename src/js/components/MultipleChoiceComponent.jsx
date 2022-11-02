function isAnswerSelected(userAnswer, answer) {
    if (userAnswer === answer) {
        return "checked";
    }

    return "";
}

let ShowCorrectAnswers = {
    view: function(vnode) {
        let properties = vnode.attrs;
        if (properties.userAnswer === properties.correctAnswer) {
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

var MultipleChoiceComponent = {
    view: function(vnode) {
        let properties = vnode.attrs
        return <div className="py-2">
            <div className="mb-1 fw-bold">
                { properties.questionNumber + 1 }. { properties.question }
            </div>
            <div className="random-answer">
                { properties.randomAnswer }
            </div>
            <div className="mt-2">
                {
                    properties.answers.map(answer => {
                        return <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="radio" id={answer}
                                checked={isAnswerSelected(properties.userAnswer, answer)}
                                onclick={() => properties.onAnswerSelection(properties.question, answer) }
                            />
                            <label class="form-check-label" for={answer}>{ answer }</label>
                        </div>
                    })
                }
            </div>
            { 
                properties.showResults && <ShowCorrectAnswers userAnswer={properties.userAnswer} correctAnswer={properties.correctAnswer} />
            }
        </div>
    }
}

export { MultipleChoiceComponent }