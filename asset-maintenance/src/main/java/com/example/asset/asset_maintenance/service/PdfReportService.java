package com.example.asset.asset_maintenance.service;

import com.example.asset.asset_maintenance.entity.MaintenanceTask;
import com.example.asset.asset_maintenance.entity.MaterialRequest;
import com.example.asset.asset_maintenance.entity.ServiceReport;
import com.example.asset.asset_maintenance.repository.MaterialRequestRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    private final MaterialRequestRepository materialRequestRepository;

    public ByteArrayInputStream generateMaintenanceReport(MaintenanceTask task) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Styling colors
            Color primaryColor = new Color(37, 99, 235); // Blue
            Color secondaryColor = new Color(71, 85, 105); // Slate
            Color lightGray = new Color(248, 250, 252);

            // Fonts
            Font mainTitleFont = new Font(Font.HELVETICA, 20, Font.BOLD, primaryColor);
            Font sectionTitleFont = new Font(Font.HELVETICA, 13, Font.BOLD, secondaryColor);
            Font labelFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
            Font valueFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.DARK_GRAY);
            Font italicFont = new Font(Font.HELVETICA, 9, Font.ITALIC, Color.DARK_GRAY);

            // Header Banner Table
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);
            headerTable.setSpacingAfter(20);
            
            PdfPCell titleCell = new PdfPCell(new Paragraph("WORK ORDER SERVICE REPORT", mainTitleFont));
            titleCell.setBorder(Rectangle.BOTTOM);
            titleCell.setBorderColor(primaryColor);
            titleCell.setBorderWidth(2);
            titleCell.setPaddingBottom(10);
            headerTable.addCell(titleCell);
            document.add(headerTable);

            // Section 1: Task Information
            Paragraph s1Title = new Paragraph("1. Task Information", sectionTitleFont);
            s1Title.setSpacingAfter(8);
            document.add(s1Title);

            PdfPTable taskInfoTable = new PdfPTable(2);
            taskInfoTable.setWidthPercentage(100);
            taskInfoTable.setSpacingAfter(16);
            taskInfoTable.setWidths(new float[]{1f, 1f});

            addTaskInfoRow(taskInfoTable, "Task Code:", task.getTaskCode(), labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Priority:", task.getPriority().name(), labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Title:", task.getTitle(), labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Current Status:", task.getStatus().name(), labelFont, valueFont);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            addTaskInfoRow(taskInfoTable, "Reported At:", task.getCreatedAt() != null ? task.getCreatedAt().format(formatter) : "N/A", labelFont, valueFont);
            addTaskInfoRow(taskInfoTable, "Completed At:", task.getCompletedAt() != null ? task.getCompletedAt().format(formatter) : "N/A", labelFont, valueFont);
            
            document.add(taskInfoTable);

            // Section 2: Asset Details
            Paragraph s2Title = new Paragraph("2. Affected Asset", sectionTitleFont);
            s2Title.setSpacingAfter(8);
            document.add(s2Title);

            PdfPTable assetInfoTable = new PdfPTable(2);
            assetInfoTable.setWidthPercentage(100);
            assetInfoTable.setSpacingAfter(16);
            
            if (task.getAsset() != null) {
                addTaskInfoRow(assetInfoTable, "Asset Name:", task.getAsset().getAssetName(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Asset Code:", task.getAsset().getAssetCode(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Category:", task.getAsset().getCategory(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Location:", task.getAsset().getLocation(), labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Manufacturer:", task.getAsset().getManufacturer() != null ? task.getAsset().getManufacturer() : "N/A", labelFont, valueFont);
                addTaskInfoRow(assetInfoTable, "Installation Date:", task.getAsset().getInstallationDate() != null ? task.getAsset().getInstallationDate().toString() : "N/A", labelFont, valueFont);
            } else {
                PdfPCell emptyAssetCell = new PdfPCell(new Paragraph("No asset associated with this task.", italicFont));
                emptyAssetCell.setColspan(2);
                emptyAssetCell.setBorder(Rectangle.NO_BORDER);
                assetInfoTable.addCell(emptyAssetCell);
            }
            document.add(assetInfoTable);

            // Section 3: Technician Service Report
            Paragraph s3Title = new Paragraph("3. Service Report", sectionTitleFont);
            s3Title.setSpacingAfter(8);
            document.add(s3Title);

            ServiceReport report = task.getServiceReport();
            if (report != null) {
                PdfPTable reportTable = new PdfPTable(1);
                reportTable.setWidthPercentage(100);
                reportTable.setSpacingAfter(16);

                addBlockCell(reportTable, "Root Cause of Issue:", report.getRootCause(), labelFont, valueFont, lightGray);
                addBlockCell(reportTable, "Work Performed:", report.getWorkPerformed(), labelFont, valueFont, Color.WHITE);
                addBlockCell(reportTable, "Time Spent (Minutes):", String.valueOf(report.getTimeSpentMinutes()) + " mins", labelFont, valueFont, lightGray);
                addBlockCell(reportTable, "Maintenance Recommendations:", report.getRecommendations() != null ? report.getRecommendations() : "None provided", labelFont, valueFont, Color.WHITE);

                document.add(reportTable);
            } else {
                Paragraph noReport = new Paragraph("No technician service report submitted yet.", italicFont);
                noReport.setSpacingAfter(16);
                document.add(noReport);
            }

            // Section 4: Materials Consumed
            Paragraph s4Title = new Paragraph("4. Materials & Spares Consumed", sectionTitleFont);
            s4Title.setSpacingAfter(8);
            document.add(s4Title);

            List<MaterialRequest> requests = materialRequestRepository.findByTaskId(task.getId());
            List<MaterialRequest> approvedRequests = requests.stream()
                    .filter(r -> r.getStatus() == MaterialRequest.RequestStatus.APPROVED)
                    .toList();

            if (!approvedRequests.isEmpty()) {
                PdfPTable materialTable = new PdfPTable(3);
                materialTable.setWidthPercentage(100);
                materialTable.setSpacingAfter(16);
                materialTable.setWidths(new float[]{2f, 1f, 1f});

                // Headers
                PdfPCell h1 = new PdfPCell(new Paragraph("Material Name", labelFont));
                h1.setBackgroundColor(lightGray);
                PdfPCell h2 = new PdfPCell(new Paragraph("Quantity Approved", labelFont));
                h2.setBackgroundColor(lightGray);
                PdfPCell h3 = new PdfPCell(new Paragraph("Status", labelFont));
                h3.setBackgroundColor(lightGray);

                materialTable.addCell(h1);
                materialTable.addCell(h2);
                materialTable.addCell(h3);

                for (MaterialRequest r : approvedRequests) {
                    materialTable.addCell(new PdfPCell(new Paragraph(r.getMaterialName(), valueFont)));
                    materialTable.addCell(new PdfPCell(new Paragraph(String.valueOf(r.getQuantity()), valueFont)));
                    materialTable.addCell(new PdfPCell(new Paragraph(r.getStatus().name(), valueFont)));
                }
                document.add(materialTable);
            } else {
                Paragraph noMaterials = new Paragraph("No materials or spare parts approved for this work order.", italicFont);
                noMaterials.setSpacingAfter(20);
                document.add(noMaterials);
            }

            // Footer / Signature Section
            document.add(new Chunk("\n\n"));
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            sigTable.setWidths(new float[]{1f, 1f});

            PdfPCell leftSig = new PdfPCell();
            leftSig.setBorder(Rectangle.NO_BORDER);
            leftSig.addElement(new Paragraph("Technician Signature: _______________________", labelFont));
            leftSig.addElement(new Paragraph("Assigned To: " + (task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : "N/A"), valueFont));
            sigTable.addCell(leftSig);

            PdfPCell rightSig = new PdfPCell();
            rightSig.setBorder(Rectangle.NO_BORDER);
            rightSig.addElement(new Paragraph("Manager Signature: _______________________", labelFont));
            rightSig.addElement(new Paragraph("Approved By: " + (task.getApprovedBy() != null ? task.getApprovedBy().getFullName() : "N/A"), valueFont));
            sigTable.addCell(rightSig);

            document.add(sigTable);

            document.close();

        } catch (DocumentException e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTaskInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell c1 = new PdfPCell(new Paragraph(label, labelFont));
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPadding(4);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Paragraph(value != null ? value : "N/A", valueFont));
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPadding(4);
        table.addCell(c2);
    }

    private void addBlockCell(PdfPTable table, String title, String content, Font titleFont, Font contentFont, Color bg) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(8);
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(new Color(226, 232, 240)); // border-slate-200
        
        Paragraph t = new Paragraph(title, titleFont);
        t.setSpacingAfter(4);
        cell.addElement(t);
        cell.addElement(new Paragraph(content, contentFont));
        
        table.addCell(cell);
    }
}
