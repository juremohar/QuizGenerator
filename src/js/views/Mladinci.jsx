import { TrueFalseComponent } from '../components/TrueFalseComponent';
import { MultipleChoiceComponent } from '../components/MultipleChoiceComponent';
import Constants from '../constants';
import { generateTrueFalseQuestions, generateMultipleChoiceQuestions  } from '../../helpers/questions';


let state = {
    trueFalseQuestions: [],
    showTrueFalseQuestionsResult: false,
    firstAidQuestions: [],
    showFirstAidQuestionsResult: false,
    firePreventionQuestions: [],
    showFirePreventionQuestionsResult: false
};

function handleUserTrueFalseSelection(questionNumber, trueFalse) {
    if (state.showTrueFalseQuestionsResult) return;
    state.trueFalseQuestions[questionNumber].userAnswer = trueFalse;
}

function handleFirstAidSelection(questionNumber, userAnswer) {
    if (state.showFirstAidQuestionsResult) return;
    state.firstAidQuestions[questionNumber].userAnswer = userAnswer;
}

function handleFirePreventionSelection(questionNumber, userAnswer) {
    if (state.showFirePreventionQuestionsResult) return;
    state.firePreventionQuestions[questionNumber].userAnswer = userAnswer;
}

let TrueFalse = {
    oninit: function() {
        state.trueFalseQuestions = generateTrueFalseQuestions(Constants.Mladinec, ["ves_neves", "zgodovina", "vescine"], 10);
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
                            correctAnswer={q.correctAnswer}
                            source={q.source}
                            randomAnswer={q.randomAnswer} 
                            userAnswer={q.userAnswer}
                            questionNumber={index}
                            showResults={state.showTrueFalseQuestionsResult} 
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

let FirstAid = {
    oninit: function() {
        state.firstAidQuestions = generateMultipleChoiceQuestions(Constants.Mladinec, ["prva_pomoc"], 10);
    },
    view: function() {
        return <div className="my-4">
            <div className='fs-4 fw-bold'>
                Prva pomoč
            </div>

            <div className='mb-2 fw-light'>
                Spodaj je 10 vprašanj. Izberite kateri odgovor je pravilen.
            </div>

            <div className='mb-2'>
                {
                    state.firstAidQuestions.map((q, index) => {
                        return <MultipleChoiceComponent 
                            question={q.question} 
                            correctAnswer={q.correctAnswer}
                            answers={q.answers} 
                            userAnswer={q.userAnswer}
                            questionNumber={index}
                            showResults={state.showFirstAidQuestionsResult} 
                            onAnswerSelection={handleFirstAidSelection} 
                        />
                    })
                }
            </div>

            <button 
                type="button" 
                class="btn btn-primary check-result-button"
                onclick={() => { state.showFirstAidQuestionsResult = true }}
            >Preveri</button>
        </div>
    }
}

let FirePrevention = {
    oninit: function() {
        state.firePreventionQuestions = generateMultipleChoiceQuestions(Constants.Mladinec, ["ves_neves", "zgodovina", "vescine"], 10);
    },
    view: function() {
        return <div className="my-4">
            <div className='fs-4 fw-bold'>
                Požarna preventiva
            </div>

            <div className='mb-2 fw-light'>
                Spodaj je 10 vprašanj. Izberite kateri odgovor je pravilen.
            </div>

            <div className='mb-2'>
                {
                    state.firePreventionQuestions.map((q, index) => {
                        return <MultipleChoiceComponent 
                            question={q.question} 
                            correctAnswer={q.correctAnswer}
                            source={q.source}
                            answers={q.answers} 
                            userAnswer={q.userAnswer}
                            questionNumber={index}
                            showResults={state.showFirePreventionQuestionsResult} 
                            onAnswerSelection={handleFirePreventionSelection} 
                        />
                    })
                }
            </div>

            <button 
                type="button" 
                class="btn btn-primary check-result-button"
                onclick={() => { state.showFirePreventionQuestionsResult = true }}
            >Preveri</button>
        </div>
    }
}

var MladinciView = {
    oninit: function() {
    },
    view: function() {
        return <div>
           <TrueFalse />
           <FirstAid />
           <FirePrevention />
        </div>
    }
}

export { MladinciView }
