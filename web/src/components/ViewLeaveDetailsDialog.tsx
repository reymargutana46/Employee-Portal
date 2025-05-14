import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Leave } from "@/types/leave";
import dayjs from "dayjs";

interface ViewLeaveDetailsDialogProps {
  leave: Leave;
  open: boolean;
  onClose: () => void;
}

const ViewLeaveDetailsDialog = ({
  leave,
  open,
  onClose,
}: ViewLeaveDetailsDialogProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    // Get the content to print
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;

    // Create a new window for printing
    const win = window.open("", "", "height=700,width=700");
    if (!win) return;

    // School information
    const schoolName = "ADCS Elementary School";
    const schoolAddress = "123 Education Way, Springfield, IL 12345";
    const schoolLogo = "/api/placeholder/150/80"; // Placeholder for school logo

    win.document.write(`
      <html>
      <head>
        <title>${schoolName} - Leave Request</title>
        <style>
          @media print {
            @page {
              margin: 0.5in;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            margin: 0;
            color: #333;
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2c5282;
            padding-bottom: 20px;
          }
          .logo-container {
            margin-right: 20px;
          }
          .school-info {
            flex-grow: 1;
          }
          .school-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c5282;
            margin: 0;
          }
          .school-address {
            font-size: 14px;
            margin-top: 5px;
          }
          .document-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            text-transform: uppercase;
          }
          .details {
            font-size: 16px;
            line-height: 1.5;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="${schoolLogo}" alt="${schoolName} Logo" height="80" />
          </div>
          <div class="school-info">
            <h1 class="school-name">${schoolName}</h1>
            <div class="school-address">${schoolAddress}</div>
          </div>
        </div>

        <div class="document-title">Leave Request Form</div>

        <div class="details">
          ${printContents}
        </div>

        <div class="footer">
          <p>Official Document - ${schoolName}</p>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `);

    win.document.close();

    // Add slight delay to ensure content is loaded before printing
    setTimeout(() => {
      win.focus();
      win.print();
      // Uncomment the next line if you want the print window to close after printing
      // win.close();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="details space-y-3">
          <div>
            <b>Employee:</b> {leave.employee.fname} {leave.employee.lname}
          </div>
          <div>
            <b>Leave Type:</b> {leave.leave_type.name}
          </div>
          <div>
            <b>Period:</b> {dayjs(leave.from).format("MMM D, YYYY")} to{" "}
            {dayjs(leave.to).format("MMM D, YYYY")}
          </div>
          <div>
            <b>Status:</b> {leave.status}
          </div>
          <div>
            <b>Reason:</b> {leave.reason}
          </div>
          {leave.status === "Rejected" && leave.leave_rejection && (
            <div>
              <b>Rejected Reason:</b>{" "}
              <span className="text-red-600">
                {leave.leave_rejection.rejreason}
              </span>
            </div>
          )}
          <div>
            <b>Submitted:</b> {new Date(leave.created_at).toLocaleDateString()}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint}>Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ViewLeaveDetailsDialog;
