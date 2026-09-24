import { AuditHistory } from "@/components/audit-history";
import { Fragment } from "react";
import { useWorkspace } from "@/components/workspace-context";

export function Audit() {
  const {
    auditBackLabel,
    auditNarrow,
    auditNext,
    auditPrev,
    auditWide,
    byMemberBg,
    byMemberColor,
    byPointBg,
    byPointColor,
    filters,
    goAuditBack,
    isAudit,
    isFin02,
    isOps01,
    isPpl03,
    isStories,
    message,
    onReason,
    openAiAudit,
    overrideBtnBg,
    overrideBtnBorder,
    overrideBtnColor,
    overrideOpen,
    ppl03Sources,
    queueNavLabel,
    queueShown,
    saveOverride,
    setByMember,
    setByPoint,
    setField,
    setupPadR,
    toastAccept,
    toastReask,
    toastReject,
    toggleOverride,
  } = useWorkspace();
  return (
    <>
      {isAudit ? (
        <>
          <div
            data-screen-label={"Audit"}
            style={{
              boxSizing: "border-box",
              paddingRight: setupPadR,
              height: "calc(100dvh - 52px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              maxWidth: "1400px",
              margin: "0 auto",
              width: "100%",
              padding: "10px 60px 12px 24px",
            }}
          >
            <button onClick={goAuditBack} className="ui-300 hover-4">
              {auditBackLabel}
            </button>
            <div className="ui-301">
              <h1 className="ui-213">{"Audit"}</h1>
              {auditNarrow ? (
                <>
                  <div className="ui-302">
                    <button onClick={auditPrev} className="ui-303 hover-2">
                      {"‹"}
                    </button>
                    <span className="ui-304">{queueNavLabel}</span>
                    <button onClick={auditNext} className="ui-303 hover-2">
                      {"›"}
                    </button>
                  </div>
                </>
              ) : null}
              <div className="ui-117">
                <button
                  onClick={setByMember}
                  style={{
                    minHeight: "28px",
                    padding: "0 12px",
                    border: "none",
                    background: byMemberBg,
                    color: byMemberColor,
                    fontSize: "12.5px",
                    fontWeight: "500",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    lineHeight: "19px",
                  }}
                >
                  {"By member"}
                </button>
                <button
                  onClick={setByPoint}
                  style={{
                    minHeight: "28px",
                    padding: "0 12px",
                    border: "none",
                    borderLeft: "1px solid #D5D5D1",
                    background: byPointBg,
                    color: byPointColor,
                    fontSize: "12.5px",
                    fontWeight: "500",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    lineHeight: "19px",
                  }}
                >
                  {"By data point"}
                </button>
              </div>
            </div>
            <div data-tour={"audit-split"} className="ui-305">
              <AuditHistory />
              {auditWide ? (
                <>
                  <div className="ui-306">
                    <div className="ui-307">
                      {filters.map((f, index) => (
                        <Fragment key={f.id ?? f.code ?? index}>
                          <button
                            onClick={f.go}
                            style={{
                              minHeight: "24px",
                              padding: "0 9px",
                              borderRadius: "999px",
                              border: "1px solid " + f.border,
                              background: f.bg,
                              color: f.color,
                              fontSize: "11.5px",
                              fontWeight: "500",
                              fontFamily: "inherit",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              lineHeight: "17px",
                            }}
                          >
                            {f.label + " " + f.count}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <div className="ui-308">
                      {queueShown.map((q, index) => (
                        <Fragment key={q.id ?? q.code ?? index}>
                          <button
                            onClick={q.sel}
                            style={{
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              background: q.rowBg,
                              border: "none",
                              borderBottom: "1px solid #F1F1EF",
                              borderLeft: "2px solid " + q.rowEdge,
                              padding: "10px 12px",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              whiteSpace: "nowrap",
                            }}
                            className="hover-5"
                          >
                            <div className="ui-309">
                              <span className="ui-310">{q.name}</span>{" "}
                              <span
                                style={{
                                  display: "inline-flex",
                                  minHeight: "17px",
                                  padding: "0 7px",
                                  borderRadius: "999px",
                                  fontSize: "10.5px",
                                  fontWeight: "500",
                                  alignItems: "center",
                                  color: q.sColor,
                                  background: q.sBg,
                                  whiteSpace: "nowrap",
                                  flexShrink: "0",
                                  lineHeight: "15px",
                                }}
                              >
                                {q.status}
                              </span>
                            </div>
                            <div className="ui-311">
                              {q.member + " · "}
                              <span className="ui-91">{q.code}</span>
                            </div>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                    <div className="ui-312">
                      {"J K move · A accept · R re-ask"}
                    </div>
                  </div>
                </>
              ) : null}
              {isFin02 ? (
                <>
                  <div className="ui-313">
                    <div className="ui-314">
                      <div className="ui-315">
                        <span className="ui-316">
                          {"📄 ONEPUT-FY2025-audited-statements.pdf"}
                        </span>{" "}
                        <span className="ui-317">{"page 3 of 24"}</span>
                      </div>
                      <div className="ui-318">
                        <div className="ui-319">
                          <div className="ui-320">
                            {"บริษัท วันพุธ เทคโนโลยี จำกัด"}
                          </div>
                          <div className="ui-321">
                            {
                              "งบกำไรขาดทุน สำหรับปีสิ้นสุดวันที่ 31 ธันวาคม 2568"
                            }
                          </div>
                          <div className="ui-322">
                            <span></span>{" "}
                            <span className="ui-91">{"หน่วย: บาท"}</span>
                          </div>
                          <div className="ui-323">
                            <span>{"รายได้"}</span> <span></span>
                          </div>
                          <div data-tour={"audit-line"} className="ui-324">
                            <span>{"รายได้จากการให้บริการ (หมายเหตุ 18)"}</span>{" "}
                            <span className="ui-325">{"4,180,000.00"}</span>
                          </div>
                          <div className="ui-326">
                            <span>{"รายได้อื่น"}</span>{" "}
                            <span className="ui-91">{"36,500.00"}</span>
                          </div>
                          <div className="ui-327">
                            <span>{"รวมรายได้"}</span>{" "}
                            <span className="ui-91">{"4,216,500.00"}</span>
                          </div>
                          <div className="ui-328">
                            <span>{"ค่าใช้จ่าย"}</span> <span></span>
                          </div>
                          <div className="ui-326">
                            <span>{"ต้นทุนการให้บริการ"}</span>{" "}
                            <span className="ui-91">{"2,145,000.00"}</span>
                          </div>
                          <div className="ui-326">
                            <span>{"ค่าใช้จ่ายในการบริหาร"}</span>{" "}
                            <span className="ui-91">{"1,388,200.00"}</span>
                          </div>
                          <div className="ui-329"></div>
                          <div className="ui-330"></div>
                          <div className="ui-331"></div>
                          <div className="ui-332"></div>
                        </div>
                      </div>
                    </div>
                    <div className="ui-333">
                      <div className="ui-334">
                        <div className="ui-335">
                          <span className="ui-114">{"The record"}</span>{" "}
                          <span className="ui-203">
                            {"FIN-02 · "}
                            <span className="ui-336">{"change mapping"}</span>
                          </span>
                        </div>
                        <div className="ui-337">
                          <div>
                            <div className="ui-338">
                              {"As found in the file"}
                            </div>
                            <div className="ui-339">
                              {
                                "รายได้จากการให้บริการ 4,180,000.00 บาท, หมายเหตุ 18"
                              }
                            </div>
                          </div>
                          <div>
                            <div className="ui-338">{"How it was read"}</div>
                            <div className="ui-340">
                              {
                                "Note 18 splits service income by segment. No conversion, values are already THB."
                              }
                            </div>
                          </div>
                          <div className="ui-341">
                            <div className="ui-338">{"Final value"}</div>
                            <div className="ui-342">
                              {"Studio 3,240,000 THB"}
                              <br />
                              {"Ventures 940,000 THB"}
                            </div>
                            <div className="ui-343">{"FY2025, full year"}</div>
                          </div>
                          <div className="ui-344">
                            <div className="ui-47">
                              <div className="ui-338">{"Confidence"}</div>
                              <div className="ui-68">
                                {"Very sure "}
                                <span className="ui-345">{"0.92"}</span>
                              </div>
                              <div className="ui-346">
                                {
                                  "the split is stated in note 18, nothing inferred"
                                }
                              </div>
                            </div>
                            <div className="ui-47">
                              <div className="ui-338">{"Submitted"}</div>
                              <div className="ui-347">
                                {"External accountant"}
                              </div>
                              <div className="ui-292">
                                {"15 Aug 2026, 14:02"}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="ui-338">{"History"}</div>
                            <div className="ui-348">
                              {
                                "v1, extracted from the uploaded statements. Nothing edited."
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      {overrideOpen ? (
                        <>
                          <div className="ui-349">
                            <div className="ui-138">
                              {"Edit as an override"}
                            </div>
                            <div className="ui-350">
                              {"Was, "}
                              <span className="ui-91">
                                {"Studio 3,240,000 · Ventures 940,000 THB"}
                              </span>
                              {
                                ". The original stays in history and the accountant is notified."
                              }
                            </div>
                            <input
                              defaultValue={
                                "Studio 3,240,000 · Ventures 940,000"
                              }
                              className="ui-351"
                              onChange={(e) =>
                                setField("overrideValue", e.target.value)
                              }
                            />
                            <textarea
                              onChange={onReason}
                              onInput={onReason}
                              placeholder={"Reason, required"}
                              className="ui-352"
                            ></textarea>
                            <div className="ui-353">
                              <button
                                onClick={saveOverride}
                                style={{
                                  minHeight: "30px",
                                  padding: "0 14px",
                                  borderRadius: "6px",
                                  border: "1px solid " + overrideBtnBorder,
                                  background: overrideBtnBg,
                                  color: overrideBtnColor,
                                  fontSize: "12.5px",
                                  fontWeight: "500",
                                  fontFamily: "inherit",
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  lineHeight: "19px",
                                }}
                              >
                                {"Save override"}
                              </button>
                              <button
                                onClick={toggleOverride}
                                className="ui-354 hover-2"
                              >
                                {"Cancel"}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : null}
                      <div data-tour={"audit-actions"} className="ui-355">
                        <div className="ui-356">
                          <button
                            onClick={toastAccept}
                            className="ui-357 hover-1"
                          >
                            {"Accept"}
                          </button>
                          <button
                            onClick={toggleOverride}
                            className="ui-358 hover-2"
                          >
                            {"Edit value"}
                          </button>
                          <button
                            onClick={toastReask}
                            className="ui-358 hover-2"
                          >
                            {"Re-ask member"}
                          </button>
                          <button
                            onClick={toastReject}
                            className="ui-359 hover-7"
                          >
                            {"Reject"}
                          </button>
                          <button
                            onClick={openAiAudit}
                            className="ui-360 hover-2"
                          >
                            {"Ask Oneput"}
                          </button>
                        </div>
                        <div className="ui-361">
                          {
                            "Log · extracted 15 Aug 14:02 · mapped to FIN-02 14:02 · nothing reviewed yet"
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {isStories ? (
                <>
                  <div className="ui-313">
                    <div className="ui-362">
                      <div className="ui-363">{"As told"}</div>
                      <div className="ui-364">
                        {
                          "The AIS workshop one. They came with a broken onboarding flow, we ran two days with their team, the new flow shipped in June and drop-off fell by about a third."
                        }
                      </div>
                      <div className="ui-292">
                        {"Studio lead, in the chat, 26 Jul 2026 10:14"}
                      </div>
                    </div>
                    <div className="ui-333">
                      <div className="ui-334">
                        <div className="ui-191">
                          <span className="ui-114">{"As drafted"}</span>{" "}
                          <span className="ui-203">{"OPS-04"}</span>
                        </div>
                        <p className="ui-365">
                          {
                            "AIS arrived with an onboarding flow that was losing users. After a two day working session with their team, the redesigned flow shipped in June and drop-off fell by roughly a third."
                          }
                        </p>
                        <div className="ui-366">
                          <div className="ui-338">{"How it was read"}</div>
                          <div className="ui-367">
                            {
                              "Drafted from the member's message, nothing added that was not said."
                            }
                          </div>
                        </div>
                      </div>
                      <div className="ui-368">
                        <div className="ui-356">
                          <button
                            onClick={toastAccept}
                            className="ui-357 hover-1"
                          >
                            {"Accept"}
                          </button>
                          <button
                            onClick={toggleOverride}
                            className="ui-358 hover-2"
                          >
                            {"Edit the draft"}
                          </button>
                          <button
                            onClick={toastReask}
                            className="ui-358 hover-2"
                          >
                            {"Re-ask member"}
                          </button>
                          <button
                            onClick={toastReject}
                            className="ui-359 hover-7"
                          >
                            {"Reject"}
                          </button>
                          <button
                            onClick={openAiAudit}
                            className="ui-360 hover-2"
                          >
                            {"Ask Oneput"}
                          </button>
                        </div>
                        <div className="ui-361">
                          {
                            "Log · told 26 Jul 10:14 · drafted 26 Jul 10:15 · nothing reviewed yet"
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {isOps01 ? (
                <>
                  <div className="ui-313">
                    <div className="ui-314">
                      <div className="ui-315">
                        <span className="ui-316">
                          {"⚡ Invoices 2025 · Google Sheets"}
                        </span>{" "}
                        <span className="ui-317">{"rows 4 to 14"}</span>
                      </div>
                      <div className="ui-318">
                        <div className="ui-369">
                          <div className="ui-370">
                            <span className="ui-371"></span>{" "}
                            <span className="ui-371">{"Client"}</span>{" "}
                            <span className="ui-371">{"Billed"}</span>{" "}
                            <span className="ui-371">{"THB"}</span>
                          </div>
                          <div className="ui-372">
                            <span className="ui-373">{"4"}</span>{" "}
                            <span className="ui-371">
                              {"AIS, onboarding workshop"}
                            </span>{" "}
                            <span className="ui-371">{"Jun 2025"}</span>{" "}
                            <span className="ui-371">{"420,000"}</span>
                          </div>
                          <div className="ui-372">
                            <span className="ui-373">{"5"}</span>{" "}
                            <span className="ui-371">
                              {"SCG, service blueprint"}
                            </span>{" "}
                            <span className="ui-371">{"Mar 2025"}</span>{" "}
                            <span className="ui-371">{"380,000"}</span>
                          </div>
                          <div className="ui-372">
                            <span className="ui-373">{"6"}</span>{" "}
                            <span className="ui-371">
                              {"Krungsri, advisory retainer"}
                            </span>{" "}
                            <span className="ui-371">{"Jan to Dec"}</span>{" "}
                            <span className="ui-371">{"960,000"}</span>
                          </div>
                          <div className="ui-372">
                            <span className="ui-373">{"7"}</span>{" "}
                            <span className="ui-371">
                              {"8 more rows, 4 to 14 highlighted"}
                            </span>{" "}
                            <span className="ui-371">{"…"}</span>{" "}
                            <span className="ui-371">{"…"}</span>
                          </div>
                          <div className="ui-374">
                            <span className="ui-373">{"15"}</span>{" "}
                            <span className="ui-373">
                              {"internal, not billed"}
                            </span>{" "}
                            <span className="ui-373">{"—"}</span>{" "}
                            <span className="ui-373">{"—"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ui-333">
                      <div className="ui-334">
                        <div className="ui-335">
                          <span className="ui-114">{"The record"}</span>{" "}
                          <span className="ui-203">{"OPS-01"}</span>
                        </div>
                        <div className="ui-337">
                          <div>
                            <div className="ui-338">{"Source"}</div>
                            <div className="ui-375">
                              {
                                "Invoices 2025, Google Sheets, rows 4 to 14, pulled 26 Jul 09:41, confirmed by Studio lead 26 Jul 10:02."
                              }
                            </div>
                          </div>
                          <div className="ui-341">
                            <div className="ui-338">{"Final value"}</div>
                            <div className="ui-342">
                              {"11 client projects, FY2025"}
                            </div>
                            <div className="ui-343">
                              {"one line on each, drafted from the sheet"}
                            </div>
                          </div>
                          <div>
                            <div className="ui-338">{"Why it is flagged"}</div>
                            <div className="ui-376">
                              {
                                "Row 9 looks like a duplicate of row 6, same client, same amount, one month apart. Not sure, please check."
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="ui-368">
                        <div className="ui-356">
                          <button
                            onClick={toastAccept}
                            className="ui-357 hover-1"
                          >
                            {"Accept"}
                          </button>
                          <button
                            onClick={toastReask}
                            className="ui-358 hover-2"
                          >
                            {"Ask the studio lead about row 9"}
                          </button>
                          <button
                            onClick={toastReject}
                            className="ui-359 hover-7"
                          >
                            {"Reject"}
                          </button>
                          <button
                            onClick={openAiAudit}
                            className="ui-360 hover-2"
                          >
                            {"Ask Oneput"}
                          </button>
                        </div>
                        <div className="ui-361">
                          {
                            "Log · pulled 26 Jul 09:41 · confirmed 10:02 · flagged 10:03"
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {isPpl03 ? (
                <>
                  <div className="ui-377">
                    <div className="ui-334">
                      <div data-tour={"audit-flag"} className="ui-378">
                        <div className="ui-379">{"Oneput flagged this"}</div>
                        <div className="ui-380">
                          {
                            "Two sources disagree and neither covers the full year."
                          }
                        </div>
                        <div className="ui-381">
                          {
                            "Oneput asked Ops and admin on 24 Jul. The workshop log stopped in August."
                          }
                        </div>
                      </div>
                      <div className="ui-382">
                        <div>
                          <div className="ui-49">
                            {"PPL-03, workshop and programme reach"}
                          </div>
                          <div className="ui-214">
                            {
                              "One point, three partial sources. The comparison that matters here is across sources, not across sites."
                            }
                          </div>
                        </div>
                        <span className="ui-383">
                          {"Needs a fix · approximate"}
                        </span>
                      </div>
                      <div className="ui-384">
                        {ppl03Sources.map((s, index) => (
                          <Fragment key={s.id ?? s.code ?? index}>
                            <div
                              style={{
                                border: "1px solid " + s.borderColor,
                                background: s.cardBg,
                                borderRadius: "8px",
                                padding: "12px",
                              }}
                            >
                              <div className="ui-385">{"📄 " + s.source}</div>
                              <div className="ui-386">{s.kind}</div>
                              <div className="ui-387">
                                {s.value + " "}
                                <span className="ui-388">{s.unit}</span>
                              </div>
                              <div className="ui-389">
                                <span
                                  style={{
                                    fontSize: "11.5px",
                                    fontWeight: "500",
                                    color: s.confColor,
                                  }}
                                >
                                  {s.confWord}
                                </span>{" "}
                                <span className="ui-105">{s.conf}</span>
                              </div>
                              <div className="ui-390">{s.confNote}</div>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      <div className="ui-391">
                        <div>
                          <div className="ui-363">
                            {
                              "Proposed figure, labelled approximate wherever it appears"
                            }
                          </div>
                          <div className="ui-392">
                            {"about 450 persons, 9 workshops, FY2025"}
                          </div>
                          <div className="ui-393">
                            {
                              "214 registered + 180 invoiced seats + about 60 counted in photos. Overlap between sources is possible."
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ui-368">
                      <div className="ui-356">
                        <button
                          onClick={toastAccept}
                          className="ui-357 hover-1"
                        >
                          {"Accept as approximate"}
                        </button>
                        <button onClick={toastReask} className="ui-358 hover-2">
                          {"Ask ops for more sources"}
                        </button>
                        <button
                          onClick={toastReject}
                          className="ui-359 hover-7"
                        >
                          {"Reject"}
                        </button>
                        <button
                          onClick={openAiAudit}
                          className="ui-360 hover-2"
                        >
                          {"Ask Oneput"}
                        </button>
                      </div>
                      <div className="ui-361">
                        {
                          "Log · 3 sources extracted 24 to 26 Jul · flagged low confidence 26 Jul 16:42"
                        }
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
