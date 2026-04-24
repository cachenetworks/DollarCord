export default function ChannelsHomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="text-6xl mb-4">DM</div>
      <h2 className="text-dc-text text-xl font-semibold mb-2">Your Direct Messages</h2>
      <p className="text-dc-muted text-sm max-w-xs">
        Search for a user to start a DM, or use the + button in the left rail to create your first server.
      </p>
    </div>
  );
}
