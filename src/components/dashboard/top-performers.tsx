
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TopOmzetParticipant, TopMentorVisit } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

interface TopPerformersProps {
    topParticipants: TopOmzetParticipant[];
    topMentors: TopMentorVisit[];
    isLoading?: boolean;
}

export function TopPerformers({ topParticipants, topMentors, isLoading }: TopPerformersProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Participants by Revenue Growth */}
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Top 10 Growth (M0-M3)</CardTitle>
                    <CardDescription>Highest revenue growth percentage.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Participant</TableHead>
                                <TableHead className="text-right">Growth</TableHead>
                                <TableHead className="text-right">Last Rev</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-8 w-32 animate-pulse bg-muted rounded" /></TableCell>
                                        <TableCell><div className="h-8 w-12 animate-pulse bg-muted rounded ml-auto" /></TableCell>
                                        <TableCell><div className="h-8 w-20 animate-pulse bg-muted rounded ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : topParticipants.length > 0 ? (
                                topParticipants.map((p, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={p.photo || ""} />
                                                    <AvatarFallback>{getInitials(p.nama)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{p.nama}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">{p.nama_usaha}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                {p.growth.toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(p.last_revenue)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Top Mentors by Visits */}
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Most Active Mentors</CardTitle>
                    <CardDescription>Based on Luring + Perorangan visits.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mentor</TableHead>
                                <TableHead className="text-right">Visits</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="h-8 w-32 animate-pulse bg-muted rounded" /></TableCell>
                                        <TableCell><div className="h-8 w-12 animate-pulse bg-muted rounded ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : topMentors.length > 0 ? (
                                topMentors.map((m, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-500 text-xs shadow-sm border">
                                                    {i + 1}
                                                </div>
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={m.foto || ""} />
                                                    <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                                                </Avatar>
                                                <span className="truncate max-w-[150px]">{m.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-lg">
                                            {m.visit_count}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
