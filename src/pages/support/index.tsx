import {
	ArrowTopRightOnSquareIcon,
	ChatBubbleLeftRightIcon,
	CheckCircleIcon,
	ChevronDownIcon,
	DocumentTextIcon,
	EnvelopeIcon,
	LifebuoyIcon,
	PaperAirplaneIcon,
	PhoneIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/16/solid";
import { useRef, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ContentCard, PageHeader } from "@/components/page-header";
import { MenuRow, MenuSection, MenuSectionHeader, MenuSeparator } from "@/components/shared/menu-list";
import { Textarea } from "@/components/textarea";

// =============================================================================
// FAQ DATA
// =============================================================================

const faqs = [
	{
		question: "How do I create a campaign?",
		answer:
			"Navigate to the Campaigns section and click 'Create Campaign'. Fill in the campaign details including budget, listings, and target audience.",
	},
	{
		question: "How do enrollments work?",
		answer:
			"Once your campaign is live, influencers can apply to participate. You can review and approve applications from the Enrollments section.",
	},
	{
		question: "How do I add funds to my wallet?",
		answer:
			"Go to the Wallet section and click 'Add Funds'. You can add money using UPI, net banking, or card payments.",
	},
	{
		question: "How long does organization approval take?",
		answer:
			"Organization approval typically takes 1-2 business days. You'll receive an email notification once your account is approved.",
	},
	{
		question: "Can I edit a campaign after publishing?",
		answer:
			"You can edit certain campaign details while it's active, but major changes like budget or dates may require creating a new campaign.",
	},
];

// =============================================================================
// FAQ ITEM
// =============================================================================

function FAQItem({
	question,
	answer,
	isOpen,
	onToggle,
}: {
	question: string;
	answer: string;
	isOpen: boolean;
	onToggle: () => void;
}) {
	const contentRef = useRef<HTMLDivElement>(null);

	return (
		<div className="border-b border-zinc-200 last:border-b-0 dark:border-zinc-800">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
			>
				<span className="text-sm font-medium text-zinc-900 dark:text-white">{question}</span>
				<ChevronDownIcon
					className={`size-4 shrink-0 text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>
			<div
				className="grid transition-all duration-200 ease-in-out"
				style={{
					gridTemplateRows: isOpen ? "1fr" : "0fr",
				}}
			>
				<div className="overflow-hidden">
					<div ref={contentRef} className="px-4 pb-3.5">
						<p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{answer}</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// CONTACT FORM
// =============================================================================

function ContactForm() {
	const [formData, setFormData] = useState({
		subject: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [validationError, setValidationError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.subject.trim() || !formData.message.trim()) {
			setValidationError("Please fill in both subject and message fields.");
			return;
		}

		setValidationError(null);
		setIsSubmitting(true);
		try {
			const subject = encodeURIComponent(formData.subject);
			const body = encodeURIComponent(formData.message);
			window.open(`mailto:support@hypedrive.com?subject=${subject}&body=${body}`);

			setIsSubmitted(true);
			setFormData({ subject: "", message: "" });

			setTimeout(() => setIsSubmitted(false), 5000);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="flex flex-col items-center rounded-xl bg-emerald-50/60 px-6 py-8 text-center shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-950/15 dark:ring-emerald-800">
				<div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
					<CheckCircleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
				</div>
				<p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Message sent!</p>
				<p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/70">
					We'll get back to you within 24 hours.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-3.5">
			{validationError && (
				<div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
				</div>
			)}
			<div>
				<label htmlFor="support-subject" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
					Subject
				</label>
				<Input
					id="support-subject"
					value={formData.subject}
					onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
					placeholder="What do you need help with?"
					required
				/>
			</div>
			<div>
				<label htmlFor="support-message" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
					Message
				</label>
				<Textarea
					id="support-message"
					value={formData.message}
					onChange={(e) => setFormData({ ...formData, message: e.target.value })}
					placeholder="Describe your issue or question in detail..."
					rows={4}
					required
				/>
			</div>
			<Button type="submit" color="dark/zinc" className="w-full" disabled={isSubmitting}>
				<PaperAirplaneIcon className="size-4" />
				{isSubmitting ? "Sending..." : "Send Message"}
			</Button>
		</form>
	);
}

// =============================================================================
// MAIN SUPPORT PAGE
// =============================================================================

export function Support() {
	const [openFAQ, setOpenFAQ] = useState<number | null>(null);

	return (
		<div className="space-y-6 pb-20">
			{/* Header */}
			<PageHeader title="Help & Support" description="Get help with Hypedrive or contact our support team" />

			{/* Support Hero */}
			<div className="overflow-hidden rounded-xl bg-zinc-900 p-5 dark:bg-zinc-800">
				<div className="flex items-start gap-4">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
						<LifebuoyIcon className="size-5 text-white" />
					</div>
					<div className="min-w-0">
						<p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Support Center</p>
						<h2 className="mt-0.5 text-base font-semibold text-white sm:text-lg">How can we help you?</h2>
						<p className="mt-1 text-sm leading-relaxed text-white/60">
							Browse FAQs, check documentation, or reach out to our team directly.
						</p>
					</div>
				</div>
			</div>

			{/* Contact Options */}
			<div>
				<MenuSectionHeader>Contact Us</MenuSectionHeader>
				<MenuSection>
					<MenuRow
						icon={EnvelopeIcon}
						iconColor="sky"
						label="Email Support"
						value="support@hypedrive.com"
						onClick={() => window.open("mailto:support@hypedrive.com")}
						isFirst
					/>
					<MenuSeparator />
					<MenuRow
						icon={ChatBubbleLeftRightIcon}
						iconColor="emerald"
						label="Live Chat"
						value="Coming soon"
					/>
					<MenuSeparator />
					<MenuRow
						icon={PhoneIcon}
						iconColor="amber"
						label="Phone Support"
						value="+91 98765 43210"
						onClick={() => window.open("tel:+919876543210")}
						isLast
					/>
				</MenuSection>
			</div>

			{/* Resources */}
			<div>
				<MenuSectionHeader>Resources</MenuSectionHeader>
				<MenuSection>
					<MenuRow
						icon={DocumentTextIcon}
						iconColor="sky"
						label="Documentation"
						suffix={<ArrowTopRightOnSquareIcon className="size-4 text-zinc-400" />}
						onClick={() => window.open("https://docs.hypedrive.com", "_blank")}
						isFirst
					/>
					<MenuSeparator />
					<MenuRow
						icon={QuestionMarkCircleIcon}
						iconColor="violet"
						label="Help Center"
						suffix={<ArrowTopRightOnSquareIcon className="size-4 text-zinc-400" />}
						onClick={() => window.open("https://help.hypedrive.com", "_blank")}
						isLast
					/>
				</MenuSection>
			</div>

			{/* FAQ */}
			<div>
				<MenuSectionHeader>Frequently Asked Questions</MenuSectionHeader>
				<ContentCard padding="none">
					{faqs.map((faq, index) => (
						<FAQItem
							key={index}
							question={faq.question}
							answer={faq.answer}
							isOpen={openFAQ === index}
							onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
						/>
					))}
				</ContentCard>
			</div>

			{/* Contact Form */}
			<div>
				<MenuSectionHeader>Send us a message</MenuSectionHeader>
				<ContentCard padding="md">
					<ContactForm />
				</ContentCard>
			</div>
		</div>
	);
}
