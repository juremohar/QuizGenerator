
function isAnswearSelected(userAnswear, trueFalse) {
    if (userAnswear === trueFalse) {
        return "active";
    }

    return "";
}

function isUserAnswearCorrect(userAnswear, correctAnswear, randomAnswear) {
    let wasShownAnswearCorrect = correctAnswear === randomAnswear;

    return wasShownAnswearCorrect === userAnswear;
}


let ShowCorrectAnswear = {
    view: function(vnode) {
        let properties = vnode.attrs;
        if (isUserAnswearCorrect(properties.userAnswear, properties.correctAnswear, properties.randomAnswear)) {
            return <CorrectAnswear />
        }

        return <WrongAnswear correctAnswear={properties.correctAnswear} />
    }
}

let WrongAnswear = {
    view: function(vnode) {
        return <div className="callout callout-default mt-2">
            <div className="badge bg-danger mb-1">
                <i class="bi bi-x-circle"></i> Napačen odgovor!
            </div>
            <div className="correct-answear">
                { vnode.attrs.correctAnswear }
            </div>
        </div>
    }
}

let CorrectAnswear = {
    view: function() {
        return <div className="badge bg-success mt-2">
            <i class="bi bi-check-circle"></i> Pravilen odgovor!
        </div>
    }
}

var TrueFalseComponent = {
    view: function(vnode) {
        let properties = vnode.attrs
        return <div className="py-2">
            <div className="mb-1 fw-bold">
                { properties.questionNumber + 1 }. { properties.question }
            </div>
            <div className="random-answear">
                { properties.randomAnswear }
            </div>
            <div className="mt-2 trueFalseButtons">
                <button 
                    type="button" 
                    className={`btn btn-outline-dark btn-sm me-2 ${ isAnswearSelected(properties.userAnswear, true) }`}
                    onclick={() => properties.onAnswearSelection(properties.question, true) }
                >Drži</button>
                <button
                    type="button" 
                    className={`btn btn-outline-dark btn-sm ${ isAnswearSelected(properties.userAnswear, false) }`}
                    onclick={() => properties.onAnswearSelection(properties.question, false) }
                >Ne drži</button>
            </div>
            <div>
                { 
                    properties.showTrueFalseQuestionsResult && <ShowCorrectAnswear userAnswear={properties.userAnswear} correctAnswear={properties.correctAnswear} randomAnswear={properties.randomAnswear} />
                }
            </div>
        </div>
    }
}

export { TrueFalseComponent }
