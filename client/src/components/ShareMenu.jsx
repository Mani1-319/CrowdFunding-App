import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const buildShareText = (title, url) =>
  `${title ? `${title} — ` : ''}Support this on Donte: ${url}`;

const ShareMenu = ({ url: urlProp, title = 'Campaign' }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(urlProp || '');
  const wrapRef = useRef(null);

  useEffect(() => {
    setUrl(urlProp || (typeof window !== 'undefined' ? window.location.href : ''));
  }, [urlProp]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const shareText = buildShareText(title, url);
  const encText = encodeURIComponent(shareText);
  const encUrl = encodeURIComponent(url);

  const openWindow = (href) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=480');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
    setOpen(false);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: title || 'Donte', text: shareText, url });
        setOpen(false);
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const items = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      color: 'bg-[#25D366] hover:bg-[#20bd5a]',
      onClick: () =>
        openWindow(`https://wa.me/?text=${encText}`),
    },
    {
      id: 'telegram',
      label: 'Telegram',
      color: 'bg-[#0088cc] hover:bg-[#0077b5]',
      onClick: () =>
        openWindow(`https://t.me/share/url?url=${encUrl}&text=${encodeURIComponent(title || 'Donte campaign')}`),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      onClick: () =>
        openWindow(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`),
    },
    {
      id: 'twitter',
      label: 'X (Twitter)',
      color: 'bg-gray-900 hover:bg-black',
      onClick: () =>
        openWindow(`https://twitter.com/intent/tweet?text=${encText}`),
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      color: 'bg-[#0A66C2] hover:bg-[#095196]',
      onClick: () =>
        openWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`),
    },
    {
      id: 'reddit',
      label: 'Reddit',
      color: 'bg-[#FF4500] hover:bg-[#e63e00]',
      onClick: () =>
        openWindow(
          `https://www.reddit.com/submit?url=${encUrl}&title=${encodeURIComponent(title || 'Support this campaign')}`
        ),
    },
    {
      id: 'sms',
      label: 'Messages',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        openWindow(`sms:?&body=${encText}`);
      },
    },
    {
      id: 'email',
      label: 'Email',
      color: 'bg-slate-600 hover:bg-slate-700',
      onClick: () => {
        openWindow(`mailto:?subject=${encodeURIComponent(title || 'Donte campaign')}&body=${encText}`);
      },
    },
  ];

  const openInstagram = () => {
    navigator.clipboard.writeText(shareText);
    toast.success('Message copied. Paste it in Instagram Story, Reels, or a post caption.');
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  return (
    <div className="relative w-full mt-6" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-center items-center py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
      >
        <svg className="w-5 h-5 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        Share this campaign
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-slate-200/50 bg-white/95 backdrop-blur-md shadow-xl shadow-slate-900/15 p-3">
          <p className="text-xs text-gray-500 px-2 pb-2 font-medium">Share via</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
                className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white ${item.color} transition-colors`}
              >
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={openInstagram}
              className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-95 col-span-2 sm:col-span-1"
            >
              Instagram
            </button>
          </div>
          {'share' in navigator && (
            <button
              type="button"
              onClick={shareNative}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              More apps (device share)
            </button>
          )}
          <button
            type="button"
            onClick={copyLink}
            className="mt-2 w-full rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Copy link only
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
