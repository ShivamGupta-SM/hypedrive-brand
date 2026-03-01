// Base interface for all entities
export interface BaseRecord {
	id: number;
	url: string;
}

// Event Types
export interface Event extends BaseRecord {
	name: string;
	date: string;
	time: string;
	location: string;
	totalRevenue: string;
	totalRevenueChange: string;
	ticketsAvailable: number;
	ticketsSold: number;
	ticketsSoldChange: string;
	pageViews: string;
	pageViewsChange: string;
	status: "On Sale" | "Closed";
	imgUrl: string;
	thumbUrl: string;
}

// Order Types
export interface OrderAmount {
	usd: string;
	cad: string;
	fee: string;
	net: string;
}

export interface PaymentCard {
	number: string;
	type: string;
	expiry: string;
}

export interface Payment {
	transactionId: string;
	card: PaymentCard;
}

export interface Customer {
	name: string;
	email: string;
	address: string;
	country: string;
	countryFlagUrl: string;
}

export interface Order extends BaseRecord {
	date: string;
	amount: OrderAmount;
	payment: Payment;
	customer: Customer;
	event: Event;
}

// Campaign Types
export type CampaignStatus = "Active" | "Scheduled" | "Paused" | "Completed";

export interface Campaign extends BaseRecord {
	name: string;
	status: CampaignStatus;
	type: string;
	startDate: string;
	endDate: string;
	budget: string;
	spent: string;
	reach: string;
	conversions: number;
	conversionRate: string;
	imgUrl: string;
}

// Enrollment Types
export type EnrollmentStatus = "Active" | "Completed" | "Paused" | "Dropped";

export interface Enrollment extends BaseRecord {
	studentName: string;
	studentEmail: string;
	studentAvatar: string;
	courseName: string;
	courseCategory: string;
	enrollmentDate: string;
	status: EnrollmentStatus;
	progress: number;
	lastAccessed: string;
	completionDate: string | null;
}

// Country Types
export interface Country {
	name: string;
	code: string;
	flagUrl: string;
	regions: string[];
}

// Settings Types
export interface Settings {
	id: number;
	organizationName: string;
	organizationBio: string;
	organizationEmail: string;
	emailPublic: boolean;
	streetAddress: string;
	city: string;
	region: string;
	postalCode: string;
	country: string;
	currency: "cad" | "usd";
}

// User/Identity Types
export interface UserIdentity {
	id: number;
	name: string;
	email: string;
	avatar?: string;
}
