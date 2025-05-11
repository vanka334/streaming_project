import styles from "./BodyComponent.module.css"
import * as React from "react";

interface BodyComponentProps{
     children: React.ReactNode;
}
export default function BodyComponent({children}:BodyComponentProps){
return (
    <main className={styles.mainContent}>
        <div className={styles.card}>
            <div className={styles.contentItem}>
                {children}
            </div>
        </div>
    </main>
)
}
