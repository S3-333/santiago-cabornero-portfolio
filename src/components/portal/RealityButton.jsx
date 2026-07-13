// RealityButton.jsx — definitivo
function RealityButton({ onNext, isTransitioning, className = '', children = 'Cambiar realidad' }) {
    return (
      <button
        type="button"
        className={className}
        onClick={onNext}
        disabled={isTransitioning}
      >
        {children}
      </button>
    )
  }
  
  export default RealityButton