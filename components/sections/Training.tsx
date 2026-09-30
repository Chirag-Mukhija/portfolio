import { laps } from "@/content/site";
import { courses } from "@/content/training";
import { SectionHead } from "../ui";

export default function Training() {
  return (
    <section id="training" className="section lane" aria-labelledby="training-title">
      <div className="wrap">
        <SectionHead id="training" meters={laps.training} label="Always in training">
          Still in training.
        </SectionHead>

        <ol className="courses">
          {courses.map((c, i) => (
            <li key={c.title} className="course" data-reveal>
              <span className="mono" style={{ color: "var(--muted)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{c.title}</h3>
                <p className="by mono">{c.by}</p>
              </div>
              <p>{c.note}</p>
              <span className={`st mono ${c.status}`}>{c.status === "done" ? "Completed" : "In progress"}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
