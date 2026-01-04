import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Select } from "@/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { getEnrollments } from "@/data";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

type Enrollment = Awaited<ReturnType<typeof getEnrollments>>[number];

function getStatusColor(status: string) {
	switch (status) {
		case "Active":
			return "lime";
		case "Completed":
			return "sky";
		case "Paused":
			return "amber";
		case "Dropped":
			return "red";
		default:
			return "zinc";
	}
}

function ProgressBar({ progress }: { progress: number }) {
	return (
		<div className="flex items-center gap-2">
			<div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
				<div
					className="h-full rounded-full bg-indigo-500 transition-all"
					style={{ width: `${progress}%` }}
				/>
			</div>
			<span className="text-xs text-zinc-500">{progress}%</span>
		</div>
	);
}

export function EnrollmentsList() {
	const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

	useEffect(() => {
		getEnrollments().then(setEnrollments);
	}, []);

	return (
		<>
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div className="max-sm:w-full sm:flex-1">
					<Heading>Enrollments</Heading>
					<div className="mt-4 flex max-w-xl gap-4">
						<div className="flex-1">
							<InputGroup>
								<MagnifyingGlassIcon />
								<Input name="search" placeholder="Search enrollments&hellip;" />
							</InputGroup>
						</div>
						<div>
							<Select name="filter_status">
								<option value="all">All statuses</option>
								<option value="active">Active</option>
								<option value="completed">Completed</option>
								<option value="paused">Paused</option>
								<option value="dropped">Dropped</option>
							</Select>
						</div>
					</div>
				</div>
				<Button>Add enrollment</Button>
			</div>

			<Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
				<TableHead>
					<TableRow>
						<TableHeader>Student</TableHeader>
						<TableHeader>Course</TableHeader>
						<TableHeader>Category</TableHeader>
						<TableHeader>Status</TableHeader>
						<TableHeader>Progress</TableHeader>
						<TableHeader>Enrolled</TableHeader>
						<TableHeader className="text-right">Last Active</TableHeader>
					</TableRow>
				</TableHead>
				<TableBody>
					{enrollments.map((enrollment) => (
						<TableRow
							key={enrollment.id}
							href={enrollment.url}
							title={`${enrollment.studentName} - ${enrollment.courseName}`}
						>
							<TableCell>
								<div className="flex items-center gap-3">
									<Avatar src={enrollment.studentAvatar} className="size-8" />
									<div>
										<div className="font-medium">{enrollment.studentName}</div>
										<div className="text-xs text-zinc-500">{enrollment.studentEmail}</div>
									</div>
								</div>
							</TableCell>
							<TableCell className="font-medium">{enrollment.courseName}</TableCell>
							<TableCell>
								<Badge color="zinc">{enrollment.courseCategory}</Badge>
							</TableCell>
							<TableCell>
								<Badge color={getStatusColor(enrollment.status)}>{enrollment.status}</Badge>
							</TableCell>
							<TableCell>
								<ProgressBar progress={enrollment.progress} />
							</TableCell>
							<TableCell className="text-zinc-500">{enrollment.enrollmentDate}</TableCell>
							<TableCell className="text-right text-zinc-500">{enrollment.lastAccessed}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</>
	);
}
