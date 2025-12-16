import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, Search, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { QUIZ_QUESTIONS } from "@/lib/quiz-data";
import type { SubmissionWithParticipant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<SubmissionWithParticipant[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionWithParticipant[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (!session) {
        setLocation("/admin");
        return;
    }
    loadData();
  }, [setLocation]);

  useEffect(() => {
    if (!search) {
        setFilteredSubmissions(submissions);
        return;
    }
    const lower = search.toLowerCase();
    setFilteredSubmissions(submissions.filter(s => 
        s.participant.name.toLowerCase().includes(lower) || 
        s.participant.email.toLowerCase().includes(lower) ||
        s.participant.phone.includes(search)
    ));
  }, [search, submissions]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllSubmissions();
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load submissions." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setLocation("/admin");
  };

  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast({ variant: "destructive", title: "No data", description: "No submissions to export." });
      return;
    }

    // Build CSV header
    const headers = ["Name", "Qualification", "Email", "Phone", "College", "State", "City", "Pincode", "Submitted At"];
    QUIZ_QUESTIONS.forEach((q, idx) => {
      headers.push(`Q${q.id}: ${q.text.substring(0, 50)}...`);
    });

    // Build CSV rows
    const rows = submissions.map(sub => {
      const row: string[] = [];
      
      // Escape and quote helper function
      const escapeCSV = (value: string) => {
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
      };
      
      row.push(escapeCSV(sub.participant.name));
      row.push(escapeCSV(sub.participant.qualification || ''));
      row.push(escapeCSV(sub.participant.email));
      row.push(escapeCSV(sub.participant.phone));
      row.push(escapeCSV(sub.participant.collegeName || ''));
      row.push(escapeCSV(sub.participant.state || ''));
      row.push(escapeCSV(sub.participant.city || ''));
      row.push(escapeCSV(sub.participant.pincode || ''));
      row.push(escapeCSV(new Date(sub.submittedAt).toLocaleString()));
      
      QUIZ_QUESTIONS.forEach(q => {
        const answer = sub.answers[String(q.id)] || "";
        row.push(escapeCSV(answer));
      });
      
      return row.join(",");
    });

    const csv = [headers.map(h => `"${h}"`).join(","), ...rows].join("\n");
    
    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vonasec_quiz_submissions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Export Complete", description: "CSV file downloaded." });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src="/vonasec-logo.png" alt="MEGA-CV" className="h-10" />
          <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export Excel
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                    data-testid="input-search"
                    placeholder="Search by Name, Email or Phone..." 
                    className="pl-9 bg-white" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="ml-auto text-sm text-slate-500 self-center">
                Total Submissions: <span className="font-bold text-slate-900">{submissions.length}</span>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Qualification</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>College</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Pincode</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center py-10 text-slate-500">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : filteredSubmissions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={10} className="text-center py-10 text-slate-500">
                                No submissions found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredSubmissions.map((sub) => (
                            <TableRow key={sub._id}>
                                <TableCell className="whitespace-nowrap font-medium text-slate-600">
                                    {new Date(sub.submittedAt).toLocaleDateString()} <span className="text-slate-400 text-xs ml-1">{new Date(sub.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </TableCell>
                                <TableCell className="font-semibold text-slate-900">{sub.participant.name}</TableCell>
                                <TableCell>{sub.participant.qualification}</TableCell>
                                <TableCell>{sub.participant.email}</TableCell>
                                <TableCell>{sub.participant.phone}</TableCell>
                                <TableCell>{sub.participant.collegeName || '-'}</TableCell>
                                <TableCell>{sub.participant.state}</TableCell>
                                <TableCell>{sub.participant.city}</TableCell>
                                <TableCell>{sub.participant.pincode}</TableCell>
                                <TableCell className="text-right">
                                    <Button data-testid={`button-view-${sub._id}`} size="sm" variant="outline" onClick={() => setSelectedSubmission(sub)}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Answers
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </main>

      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
                <DialogDescription>
                    Answers submitted by <span className="font-semibold text-slate-900">{selectedSubmission?.participant.name}</span> ({selectedSubmission?.participant.email})
                </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-6">
                {QUIZ_QUESTIONS.map((q) => (
                    <div key={q.id} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex gap-3 mb-2">
                             <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center mt-0.5">
                                Q{q.id}
                             </span>
                             <p className="text-sm font-medium text-slate-700">{q.text}</p>
                        </div>
                        <div className="pl-9">
                            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-900 border border-slate-100">
                                {selectedSubmission?.answers[q.id] || <span className="text-slate-400 italic">No answer provided</span>}
                            </div>
                            {q.type === 'mcq' && q.correctAnswer && (
                                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                                    <span className="font-semibold text-green-600">Correct Answer:</span> {q.correctAnswer}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
