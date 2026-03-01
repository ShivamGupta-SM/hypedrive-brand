import {
	ArrowTopRightOnSquareIcon,
	ChatBubbleLeftRightIcon,
	CheckCircleIcon,
	DocumentTextIcon,
	EnvelopeIcon,
	PhoneIcon,
	QuestionMarkCircleIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import {
	MenuRow,
	MenuSection,
	MenuSectionHeader,
	MenuSeparator,
} from "@/components/shared/menu-list";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";

// =============================================================================
// FAQ SECTION
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
	return (
		<div className="border-b border-zinc-200 dark:border-zinc-800">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between py-4 text-left"
			>
				<span className="text-sm font-medium text-zinc-900 dark:text-white">{question}</span>
				<span
					className={`ml-4 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-500 transition-transform dark:bg-zinc-800 dark:text-zinc-400 ${
						isOpen ? "rotate-45" : ""
					}`}
				>
					+
				</span>
			</button>
			{isOpen && (
				<div className="pb-4">
					<p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{answer}</p>
				</div>
			)}
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.subject.trim() || !formData.message.trim()) return;

		setIsSubmitting(true);
		try {
			// Open mailto with pre-filled subject and body as fallback
			const subject = encodeURIComponent(formData.subject);
			const body = encodeURIComponent(formData.message);
			window.open(`mailto:support@hypedrive.com?subject=${subject}&body=${body}`);

			setIsSubmitted(true);
			setFormData({ subject: "", message: "" });

			// Reset success message after 5 seconds
			setTimeout(() => setIsSubmitted(false), 5000);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isSubmitted) {
		return (
			<div className="flex flex-col items-center rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
				<div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
					<CheckCircleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
				</div>
				<p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
					Message sent successfully!
				</p>
				<p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
					We'll get back to you within 24 hours.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label htmlFor="subject" className="text-sm font-medium text-zinc-900 dark:text-white">
					Subject
				</label>
				<Input
					id="subject"
					value={formData.subject}
					onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
					placeholder="What do you need help with?"
					className="mt-1.5"
					required
				/>
			</div>
			<div>
				<label htmlFor="message" className="text-sm font-medium text-zinc-900 dark:text-white">
					Message
				</label>
				<Textarea
					id="message"
					value={formData.message}
					onChange={(e) => setFormData({ ...formData, message: e.target.value })}
					placeholder="Describe your issue or question..."
					className="mt-1.5"
					rows={4}
					required
				/>
			</div>
			<Button type="submit" color="dark/zinc" className="w-full" disabled={isSubmitting}>
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
			<div>
				<Heading>Help & Support</Heading>
				<Text className="mt-1">Get help with Hypedrive or contact our support team</Text>
			</div>

			{/* Quick Actions */}
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
						value="Available 9 AM - 6 PM IST"
						onClick={() => window.open("mailto:support@hypedrive.com?subject=Live Chat Request")}
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
						iconColor="zinc"
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
				<div className="rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					<div className="px-4">
						{faqs.map((faq, index) => (
							<FAQItem
								key={index}
								question={faq.question}
								answer={faq.answer}
								isOpen={openFAQ === index}
								onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Contact Form */}
			<div>
				<MenuSectionHeader>Send us a message</MenuSectionHeader>
				<div className="rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					<ContactForm />
				</div>
			</div>
		</div>
	);
}
