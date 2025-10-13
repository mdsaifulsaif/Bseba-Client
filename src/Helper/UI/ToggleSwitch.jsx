const ToggleSwitch = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(value === 1 ? 0 : 1)}
        className={`w-12 h-6 flex items-center rounded-full px-1 transition ${
          value === 1 ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"
        }`}
      >
        <div className="w-4 h-4 bg-white rounded-full shadow"></div>
      </button>
      <span className="text-xs">{value === 1 ? "Yes" : "No"}</span>
    </div>
  );
};

export default ToggleSwitch;
