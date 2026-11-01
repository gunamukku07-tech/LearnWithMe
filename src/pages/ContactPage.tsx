import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Github,
  Linkedin,
  MessageSquare,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SEOHead } from '../components/SEOHead';

export const ContactPage: React.FC = () => {
  const { profile, submitContactMessage } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    setErrorText('');

    if (name.trim().length < 2) {
      setStatus('error');
      setErrorText('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setStatus('error');
      setErrorText('Please enter a valid email address so I can reply.');
      return;
    }
    if (subject.trim().length < 2) {
      setStatus('error');
      setErrorText('Please enter a subject for your message.');
      return;
    }
    if (message.trim().length < 5) {
      setStatus('error');
      setErrorText('Please write a message (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({ name, email, subject, message });
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setErrorText(
        err instanceof Error ? err.message : 'Could not send message. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF] pb-24">
      <SEOHead
        title="Contact & Connect — LearnWithMe"
        description="Get in touch to discuss computer science topics, suggest a weekly tutorial, collaborate on student projects, or share feedback."
        path="/contact"
      />

      {/* Header */}
      <section className="py-14 lg:py-20 bg-gradient-to-b from-[#F9EFE8] to-[#FFF8EF] border-b border-[#EDE0D5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl space-y-4 editorial-page-enter">
            <p className="text-xs uppercase tracking-[0.2em] text-[#594438] font-medium">
              Open Correspondence
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#594438] tracking-tight">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-[#887467] leading-relaxed">
              Have a question about one of my weekly blogs, a suggestion for a computer science
              topic to cover next, or want to collaborate on a project? Send a note below.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Author Info & Correspondence */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-[22px] bg-white border border-[#EDE0D5] space-y-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F7DDE1]/65 flex items-center justify-center text-[#594438]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif-section text-xl text-[#594438]">
                    {profile.name || 'Guna Sekhar'}
                  </h2>
                  <p className="text-xs text-[#887467]">
                    {profile.roleTitle || 'Integrated M.Tech CSE — 2nd Year'}
                  </p>
                </div>
              </div>

              <p className="text-xs font-mono uppercase tracking-wider text-[#594438] font-semibold">
                Learn. Create. Share. Grow.
              </p>

              <p className="text-sm text-[#887467] leading-relaxed">
                Have a question about a weekly learning topic, programming concept, or project?
                Send a message using the form and I will review it directly.
              </p>

              {(profile.email || profile.githubUrl || profile.linkedinUrl) && (
                <div className="space-y-3 pt-2 border-t border-[#EDE0D5]">
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-colors"
                    >
                      <Mail className="w-4 h-4 text-[#D9A5A5]" />
                      <span>{profile.email}</span>
                    </a>
                  )}

                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-colors"
                    >
                      <Github className="w-4 h-4 text-[#D9A5A5]" />
                      <span>GitHub Profile</span>
                    </a>
                  )}

                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-xs font-medium text-[#594438] hover:border-[#D9A5A5] transition-colors"
                    >
                      <Linkedin className="w-4 h-4 text-[#D9A5A5]" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 editorial-page-enter">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-8 sm:p-10 rounded-[22px] bg-white border border-[#EDE0D5] shadow-[0_12px_34px_-14px_rgba(89,68,56,0.07)] space-y-6"
            >
              <h2 className="font-serif-section text-2xl text-[#594438]">Send a Message</h2>

              {status === 'error' && (
                <div
                  role="alert"
                  className="p-4 rounded-xl bg-[#F7DDE1]/70 border border-[#D9A5A5] flex items-center gap-3 text-xs font-medium text-[#594438]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}

              {status === 'success' && (
                <div
                  role="status"
                  className="p-5 rounded-xl bg-[#F9EFE8] border border-[#D9A5A5] flex items-start gap-3 text-xs text-[#594438]"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#594438] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">Message Delivered!</p>
                    <p className="text-[#887467]">
                      Thank you for writing in. Your message has been securely saved to Cloud
                      Firestore and appears in the Admin Dashboard inbox.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-[#594438]">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Aarav Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438] placeholder-[#887467]/60 focus:outline-none focus:border-[#D9A5A5]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-[#594438]">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    className="w-full px-4 py-3 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438] placeholder-[#887467]/60 focus:outline-none focus:border-[#D9A5A5]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-subject" className="block text-xs font-semibold text-[#594438]">
                  Subject *
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Question about Week 05 Graph Traversal / Topic Suggestion"
                  className="w-full px-4 py-3 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438] placeholder-[#887467]/60 focus:outline-none focus:border-[#D9A5A5]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-message" className="block text-xs font-semibold text-[#594438]">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your question, feedback, or collaboration idea here..."
                  className="w-full px-4 py-3 rounded-xl bg-[#FFF8EF] border border-[#EDE0D5] text-sm text-[#594438] placeholder-[#887467]/60 focus:outline-none focus:border-[#D9A5A5] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#D9A5A5] text-[#594438] font-semibold text-sm hover:bg-[#d19595] transition-all cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
