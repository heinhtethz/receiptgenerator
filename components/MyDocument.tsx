import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { InvoiceData } from "@/types/index";

const mm = (v: number) => v * 2.835;

const styles = StyleSheet.create({
  page: {
    paddingVertical: mm(20),
    paddingHorizontal: mm(20),
    fontFamily: "Helvetica",
    color: "#111",
  },
  // --- Header Styles ---
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: mm(4),
  },
  titleText: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: mm(1.5),
    textTransform: "uppercase",
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  advBalBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: mm(4),
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#333",
    letterSpacing: 1,
    marginBottom: mm(4),
  },

  // --- Expenses List Styles ---
  listContainer: {
    marginTop: mm(4),
  },
  itemBlock: {
    marginBottom: mm(6),
  },
  mainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  indexCol: {
    width: mm(10),
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
  },
  descCol: {
    flex: 1,
    paddingRight: mm(5),
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  amountCol: {
    width: mm(25),
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    letterSpacing: 1.5,
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: mm(10),
    marginTop: mm(1.5),
    color: "#444",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subAmount: {
    width: mm(25),
    textAlign: "right",
    fontFamily: "Helvetica",
    fontSize: 14,
    letterSpacing: 1.5,
  },

  // --- Footer Styles ---
  footerContainer: {
    position: "absolute",
    bottom: mm(5),
    right: mm(17),
    marginTop: mm(10),
    alignItems: "flex-end", // ညာဘက်သို့ ကပ်ထားရန်
  },
  footerBox: {
    width: mm(75),
    borderTopColor: "#000",
    paddingTop: mm(3),
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: mm(2),
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.4,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: mm(1),
    paddingTop: mm(2),
    borderTopWidth: 2,
    borderTopColor: "#666",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
  },

  // --- Page Numbering ---
  pageNumber: {
    position: "absolute",
    right: mm(20),
    top: mm(10),
    fontSize: 8,
    color: "#888",
  },

  watermark: {
    position: "absolute",
    left: mm(20),
    top: mm(10),
    fontSize: 8,
    color: "#888",
  },
});

interface MyDocumentProps {
  data: InvoiceData;
  total: number;
  advance: number;
  balance: number;
  remaining: number;
  totalAdvanceOrBalance: number;
  formatDate: (d?: string) => string;
}

export const MyDocument = ({
  data,
  total,
  advance,
  balance,
  remaining,
  totalAdvanceOrBalance,
  formatDate,
}: MyDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page} wrap>
      {/* 1. Header Section */}
      <View style={styles.headerRow} fixed>
        <Text style={styles.titleText}>{data.port || ""}</Text>
        <Text style={styles.titleText}>{data.employeeName || ""}</Text>
        <Text style={styles.titleText}>{formatDate(data.date)}</Text>
      </View>
      {/* Advance / Balance Details under Port */}
      {(advance > 0 ||
        balance > 0 ||
        data.advanceDate ||
        data.prevBalanceDate) && (
        <View style={styles.advBalBox}>
          {balance > 0 && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text>BAL - {balance.toLocaleString()}/- </Text>
              <Text>
                {data.prevBalanceDate
                  ? `(${formatDate(data.prevBalanceDate)})`
                  : ""}
              </Text>
            </View>
          )}
          {advance > 0 && balance > 0 && (
            <Text style={{ textAlign: "center", paddingHorizontal: mm(2) }}>
              {" "}
              +{" "}
            </Text>
          )}
          {advance > 0 && (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text>ADV - {advance.toLocaleString()}/- </Text>
              <Text>
                {data.advanceDate ? `(${formatDate(data.advanceDate)})` : ""}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* 2. Expenses List Section */}
      <View style={styles.listContainer}>
        {data.expenses &&
          data.expenses.map((expense, idx) => (
            <View key={expense.id || idx} style={styles.itemBlock} wrap={false}>
              {/* Main Expense Line */}
              <View style={styles.mainRow}>
                <Text style={styles.indexCol}>{idx + 1}.</Text>
                <Text style={styles.descCol}>{expense.description}</Text>

                <Text style={styles.amountCol}>
                  {expense.amount > 0 ? expense.amount.toLocaleString() : ""}
                </Text>
              </View>

              {expense.type === "job" &&
                expense.subExpenses &&
                expense.subExpenses.map((sub, sIdx) => (
                  <View key={sub.id || sIdx} style={styles.subRow}>
                    <Text>{sub.label}</Text>
                    <Text style={styles.subAmount}>
                      {sub.amount > 0 ? sub.amount.toLocaleString() : ""}
                    </Text>
                  </View>
                ))}
            </View>
          ))}
      </View>

      {/* 3. Footer Section (TOTAL, ADVANCE, BALANCE) */}
      <View style={styles.footerContainer} wrap={false}>
        <View style={styles.footerBox}>
          <View style={styles.footerRow}>
            <Text>TOTAL</Text>
            <Text>{total.toLocaleString()}/-</Text>
          </View>

          <View style={styles.footerRow}>
            <Text>ADVANCE</Text>
            <Text>{totalAdvanceOrBalance.toLocaleString()}/-</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text>{total >= totalAdvanceOrBalance ? "CLAIM" : "BALANCE"}</Text>
            <Text>{remaining.toLocaleString()}/-</Text>
          </View>
        </View>
      </View>

      {/* 4. Page Numbering */}
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
        fixed
      />

      <Text style={styles.watermark} render={() => `Developed by Hz`} />
    </Page>
  </Document>
);
