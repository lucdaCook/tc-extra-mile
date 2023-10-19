import { useContext, useState } from "react"
import { CloudsContext } from "../contexts/CloudsContext"
import { CloudIcon } from "../svg/clouds"


export default function FeedbackForm({ info }) {

  const { submitFeedback } = useContext(CloudsContext)

  const [ feedbackStars, setFeedbackStars] = useState(0)

  return (
    <div className="feedback">
      <h4 className="give-feedback">
        Tell me how I did!
      </h4>
      <span>Let me know how good (or not) my capture was, so that next time I can do better!</span>
        <div className="star-wrapper">
        <button type='button'
          className={`feedback-star${+ feedbackStars >= 1 ? ' active-star' : ''}`}
          onClick={() => {
            setFeedbackStars(1)
            }}>
          <CloudIcon/>
        </button>
        <button type='button'
          className={`feedback-star${+ feedbackStars >= 2 ? ' active-star' : ''}`}
          onClick={() => {
            setFeedbackStars(2)
            }}>
          <CloudIcon/>
        </button>
        <button type='button'
          className={`feedback-star${+ feedbackStars >= 3 ? ' active-star' : ''}`}
          onClick={() => {
            setFeedbackStars(3)
            }}>
          <CloudIcon/>
        </button>
        <button type='button'
          className={`feedback-star${+ feedbackStars >= 4 ? ' active-star' : ''}`}
          onClick={() => {
            setFeedbackStars(4)
            }}>
          <CloudIcon/>
        </button>
        <button type='button'
          className={`feedback-star${+ feedbackStars === 5 ? ' active-star' : ''}`}
          onClick={() => {
            setFeedbackStars(5)
            }}>
          <CloudIcon/>
        </button>
        </div>
          <form
          className="feedback-form"
          onSubmit={e => submitFeedback(e, feedbackStars, info)}
          >
          <input type="text" 
          placeholder='Got anything to say..?' 
          autoComplete="off"
          name="text"
          />
          <input type='submit' value='Submit'
          className="submit-input"
          onClick={e => e.target.blur()}/> 
        </form>
      </div>
  )

}