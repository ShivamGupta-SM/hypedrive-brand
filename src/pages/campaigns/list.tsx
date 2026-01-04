import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Select } from "@/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { getCampaigns } from "@/data";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

type Campaign = Awaited<ReturnType<typeof getCampaigns>>[number];

function getStatusColor(status: string) {
	switch (status) {
		case "Active":
			return "lime";
		case "Scheduled":
			return "sky";
		case "Paused":
			return "amber";
		case "Completed":
			return "zinc";
		default:
			return "zinc";
	}
}

export function CampaignsList() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);

	useEffect(() => {
		getCampaigns().then(setCampaigns);
	}, []);

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="max-sm:w-full sm:flex-1">
					<Heading>Campaigns</Heading>
					<div className="mt-4 flex max-w-xl gap-4">
						<div className="flex-1">
							<InputGroup>
								<MagnifyingGlassIcon />
								<Input name="search" placeholder="Search campaigns&hellip;" />
							</InputGroup>
						</div>
						<div>
							<Select name="filter_status">
								<option value="all">All statuses</option>
								<option value="active">Active</option>
								<option value="scheduled">Scheduled</option>
								<option value="paused">Paused</option>
								<option value="completed">Completed</option>
							</Select>
						</div>
					</div>
				</div>
				<Button>Create campaign</Button>
			</div>

			<Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
				<TableHead>
					<TableRow>
						<TableHeader>Campaign</TableHeader>
						<TableHeader>Type</TableHeader>
						<TableHeader>Status</TableHeader>
						<TableHeader>Duration</TableHeader>
						<TableHeader>Budget</TableHeader>
						<TableHeader>Spent</TableHeader>
						<TableHeader className="text-right">Conversions</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{campaigns.map((campaign) => (
						<TableRow key={campaign.id} href={campaign.url} title={campaign.name}>
							<TableCell className="font-medium">{campaign.name}</TableCell>
							<TableCell className="text-zinc-500">{campaign.type}</TableCell>
							<TableCell>
								<Badge color={getStatusColor(campaign.status)}>{campaign.status}</Badge>
							</TableCell>
							<TableCell className="text-zinc-500">
								{campaign.startDate} - {campaign.endDate}
							</TableCell>
							<TableCell>{campaign.budget}</TableCell>
							<TableCell>{campaign.spent}</TableCell>
							<TableCell className="text-right">
								<div className="flex flex-col items-end">
									<span>{campaign.conversions.toLocaleString()}</span>
									<span className="text-xs text-zinc-500">{campaign.conversionRate}</span>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</>
	);
}
