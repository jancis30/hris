export default function Notice({ message }) {
  if (!message) return null;
  return (
    <div className={message.error ? 'notice error' : 'notice ok'} role="status">
      {message.error || message.ok}
    </div>
  );
}
