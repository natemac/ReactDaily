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
          <div className="welcome-subtitle">Let's get drawing!</div>
        </div>

        <div className="welcome-content">
          <div className="instruction-step">
            <span className="step-number">1️⃣</span>
            <div className="step-text">
              <strong>Pick a Category</strong> - Choose from Holidays, Animals, Emojis, or Shapes!
            </div>
          </div>

          <div className="instruction-step">
            <span className="step-number">2️⃣</span>
            <div className="step-text">
              <strong>Watch & Guess</strong> - A drawing will appear line by line. Can you guess what it is?
            </div>
          </div>

          <div className="instruction-step">
            <span className="step-number">3️⃣</span>
            <div className="step-text">
              <strong>Choose Your Challenge</strong> - Easy mode shows dots, Hard mode doesn't!
            </div>
          </div>

          <div className="instruction-step">
            <span className="step-number">🎯</span>
            <div className="step-text">
              <strong>Beat the Clock</strong> - Complete all 4 categories to master the daily challenge!
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