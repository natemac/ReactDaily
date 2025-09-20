import { useState } from 'react';
import './WelcomePopup.css';

function WelcomePopup({ isVisible, onClose }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('reactDaily_welcomeShown', 'true');
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-popup">
        <div className="welcome-header">
          <h2>🎨 Welcome to React Daily! 🎨</h2>
          <div className="welcome-subtitle">Go, Draw, Guess – That's It!</div>
        </div>

        <div className="welcome-content">
          <div className="instruction-step">
            <span className="step-number">1️⃣</span>
            <div className="step-text">
              <strong>Pick a Category</strong> - Choose a color to start your daily challenge!
            </div>
          </div>

          <div className="instruction-step">
            <span className="step-number">2️⃣</span>
            <div className="step-text">
              <strong>Watch & Guess</strong> - Click Begin and watch the drawing appear line by line. Can you guess what it is?
            </div>
          </div>

          <div className="instruction-step">
            <span className="step-number">3️⃣</span>
            <div className="step-text">
              <strong>Challenge Your Friends</strong> - Share your results each day and challenge your friends and family to beat your best!
            </div>
          </div>

          <div className="instruction-step">
            <span className="step-number">💪</span>
            <div className="step-text">
              <strong>Too Easy for You?</strong> - Try Hard Mode for extra difficulty but also an extra trophy!
            </div>
          </div>

          <div className="instruction-step">
            <span className="step-number">🏆</span>
            <div className="step-text">
              <strong>Everyone Likes a Trophy!</strong> - Get it in one try, get it before the image is done drawing, get it on Hard Mode to win all three trophys!
            </div>
          </div>
        </div>

        <div className="welcome-footer">
          <div className="dont-show-container">
            <label className="dont-show-label">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              Don't show this again
            </label>
          </div>

          <button className="welcome-ok-button" onClick={handleClose}>
            Let's Play! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePopup;