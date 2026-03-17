/**
 * PostChat — real-time activity chat via SSE
 */

import { useRef, useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useMessages, useSendMessage } from '../hooks';
import { userName, userColor } from '../../../lib/chat-utils';

interface Props {
  postId: string;
  createdById: string;
}

function handle(userId: string, isMe: boolean, isCreator: boolean): string {
  if (isMe) return 'you';
  return isCreator ? `${userName(userId)} · host` : userName(userId);
}

export function PostChat({ postId, createdById }: Props) {
  const { data: messages = [], isLoading } = useMessages(postId);
  const { mutate: send, isPending } = useSendMessage(postId);
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const myUserId = window.userId as string;

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function submit() {
    const t = text.trim();
    if (!t || isPending) return;
    send({ userId: myUserId, text: t });
    setText('');
    inputRef.current?.focus();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '520px',
        background: '#fafafa',
        border: '1px solid #ececec',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #ececec',
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em', color: '#111' }}>
          chat
        </span>
        <span style={{ fontSize: 11, color: '#aaa' }}>· members only</span>
      </div>

      {/* messages */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {isLoading && (
          <span style={{ fontSize: 12, color: '#bbb', alignSelf: 'center', marginTop: 40 }}>
            loading…
          </span>
        )}

        {!isLoading && messages.length === 0 && (
          <span
            style={{
              fontSize: 12,
              color: '#bbb',
              alignSelf: 'center',
              marginTop: 60,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            quiet in here.
            <br />
            say hi 👋
          </span>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.userId === myUserId;
          const isCreator = msg.userId === createdById;
          const prev = messages[i - 1];
          const grouped = prev?.userId === msg.userId;
          const color = userColor(msg.userId);

          // Check if date changed
          const msgDate = new Date(msg.createdAt);
          msgDate.setHours(0, 0, 0, 0);
          const prevDate = prev ? new Date(prev.createdAt) : null;
          prevDate?.setHours(0, 0, 0, 0);
          const dateChanged = !prevDate || msgDate.getTime() !== prevDate.getTime();

          // Format date label
          const getDateLabel = (date: Date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            if (date.getTime() === today.getTime()) return 'Today';
            if (date.getTime() === yesterday.getTime()) return 'Yesterday';
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          };

          return (
            <div key={msg.id}>
              {/* date separator — show only when date changes */}
              {dateChanged && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    margin: '16px 0 12px',
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
                  <span
                    style={{ fontSize: 11, color: '#999', fontWeight: 500, whiteSpace: 'nowrap' }}
                  >
                    {getDateLabel(msgDate)}
                  </span>
                  <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
                </div>
              )}

              {/* message bubble */}
              <div
                style={{
                  marginTop: grouped ? 1 : 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                {/* name row — only show when sender changes */}
                {!grouped && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: isMe ? '#888' : color,
                      marginBottom: 3,
                      paddingLeft: isMe ? 0 : 2,
                      paddingRight: isMe ? 2 : 0,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {handle(msg.userId, isMe, isCreator)}
                  </span>
                )}

                {/* bubble */}
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '6px 10px',
                    borderRadius: isMe ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                    background: isMe ? '#111' : '#fff',
                    color: isMe ? '#f5f5f5' : '#111',
                    fontSize: 13,
                    lineHeight: 1.45,
                    border: isMe ? 'none' : '1px solid #e8e8e8',
                    wordBreak: 'break-word',
                    boxShadow: isMe ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  {msg.text}
                </div>

                {/* time only — no date */}
                {(i === messages.length - 1 || messages[i + 1]?.userId !== msg.userId) && (
                  <span
                    style={{
                      fontSize: 11,
                      color: '#aaa',
                      marginTop: 2,
                      paddingLeft: isMe ? 0 : 2,
                      paddingRight: isMe ? 2 : 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderTop: '1px solid #ececec',
          background: '#fff',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="message…"
          autoComplete="off"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 13,
            background: 'transparent',
            color: '#111',
            caretColor: '#111',
          }}
        />
        <button
          type="submit"
          disabled={!text.trim() || isPending}
          style={{
            border: 'none',
            background: 'none',
            cursor: text.trim() && !isPending ? 'pointer' : 'default',
            padding: '4px 6px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: text.trim() && !isPending ? 1 : 0.3,
            transition: 'opacity 0.15s',
          }}
          aria-label="Send"
        >
          {/* plain arrow icon — no library needed */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
