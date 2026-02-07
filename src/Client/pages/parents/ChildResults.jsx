import  { useState,  } from "react";
import { Download,  } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChildResults() {
  const [selectedChild, setSelectedChild] = useState("child_1");
  const [term, setTerm] = useState("First");

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Academic Performance</h1>
          <p className="text-slate-500 text-sm">Review detailed scores and download terminal reports.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-[180px] bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="child_1">Chidera Nmezi</SelectItem>
              <SelectItem value="child_2">Kamsi Nmezi</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-indigo-600"><Download size={16} className="mr-2" /> Report PDF</Button>
        </div>
      </div>

      {/* SUBJECT BREAKDOWN */}
      <Card className="border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <CardTitle className="text-lg">Broadsheet View - {term} Term</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Subject</TableHead>
                <TableHead>CA (40)</TableHead>
                <TableHead>Exam (60)</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right pr-6">Teacher's Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium pl-6">Further Mathematics</TableCell>
                <TableCell>38</TableCell>
                <TableCell>52</TableCell>
                <TableCell className="font-bold text-indigo-600">90</TableCell>
                <TableCell><Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">A1</Badge></TableCell>
                <TableCell className="text-right pr-6 italic text-slate-500">Exceptional performance.</TableCell>
              </TableRow>
              {/* More rows would be mapped here */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}