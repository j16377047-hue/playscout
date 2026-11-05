export default function AdSlot({ label = "Advertisement", className = "" }) {
  const enabled = import.meta.env.VITE_ADSENSE_ENABLED === "true";
  const client = import.meta.env.VITE_ADSENSE_CLIENT;
  // Ad units are intentionally not rendered until the publisher has approval and
  // configures a real ad slot. Never click your own ads or encourage invalid traffic.
  if (!enabled || !client) {
    return <div className={`ad-placeholder ${className}`} aria-label={label}>
      <span>{label}</span><small>Ad space · available after AdSense approval</small>
    </div>;
  }
  return <div className={`ad-placeholder ${className}`} aria-label={label}>
    <span>{label}</span><small>Configure your approved AdSense ad unit in AdSlot.jsx.</small>
  </div>;
}
