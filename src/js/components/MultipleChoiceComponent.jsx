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

let Image = {
    source: null,
    oninit: function(vnode) {
        this.source = require(`../../assets/images/vescine/${vnode.attrs.source}`)
    },
    view: function() {
        return <img src={this.source} className="img-thumbnail mb-1" />
    }
}

var MultipleChoiceComponent = {
    view: function(vnode) {
        let properties = vnode.attrs
        return <div className="py-2">
            <div className="mb-1 fw-bold">
                { properties.questionNumber + 1 }. { properties.question }
            </div>
            
            {
                properties.source && <Image source={properties.source} />
            }

            <div className="mt-2">
                {
                    properties.answers.map(answer => {
                        return <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="radio" id={`${answer}-${properties.questionNumber}`}
                                checked={isAnswerSelected(properties.userAnswer, answer)}
                                onclick={() => properties.onAnswerSelection(properties.questionNumber, answer) }
                            />
                            <label class="form-check-label" for={`${answer}-${properties.questionNumber}`}>{ answer }</label>
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
