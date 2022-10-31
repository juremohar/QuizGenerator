import { TrueFalseComponent } from '../components/TrueFalseComponent';
import Constants from '../constants';
import { generateTrueFalseQuestions } from '../../helpers/questions';


let state = {
    trueFalseQuestions: [],
    showTrueFalseQuestionsResult: false
};

function handleUserTrueFalseSelection(question, trueFalse) {
    let questionsRecord = state.trueFalseQuestions.find(q => {
        return q.question == question;
    });

    questionsRecord.userAnswer = trueFalse;
}

let TrueFalse = {
    oninit: function() {
        state.trueFalseQuestions = generateTrueFalseQuestions(Constants.Pioner, 10);
    },
    view: function() {
        return <div className="my-4">
            <div className='fs-4 fw-bold'>
                Drži/ne drži
            </div>

            <div className='mb-2 fw-light'>
                Spodaj je 10 vprašanj. Ugotovite ali je odgovor na vprašanje pravilen.
            </div>

            <div className='mb-2'>
                {
                    state.trueFalseQuestions.map((q, index) => {
                        return <TrueFalseComponent 
                            question={q.question} 
                            correctAnswers={q.correctAnswers}
                            randomAnswer={q.randomAnswer} 
                            userAnswer={q.userAnswer}
                            questionNumber={index}
                            showTrueFalseQuestionsResult={state.showTrueFalseQuestionsResult} 
                            onAnswerSelection={handleUserTrueFalseSelection} 
                        />
                    })
                }
            </div>

            <button 
                type="button" 
                class="btn btn-primary check-result-button"
                onclick={() => { state.showTrueFalseQuestionsResult = true }}
            >Preveri</button>
        </div>
    }
}

var PionirjiView = {
    oninit: function() {
    },
    view: function() {
        return <div>
           <TrueFalse />
        </div>
    }
}

export { PionirjiView }
