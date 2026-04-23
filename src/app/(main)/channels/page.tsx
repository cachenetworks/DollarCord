export default function ChannelsHomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="text-6xl mb-4">💬</div>
      <h2 className="text-dc-text text-xl font-semibold mb-2">Your Direct Messages</h2>
      <p className="text-dc-muted text-sm max-w-xs">
        Select a conversation on the left, or search for a user to start a new one.
      </p>
    </div>
  );
}
