import styles from './Legend.module.scss';
import {IoLocationSharp} from "react-icons/io5";

const Legend = () => {
    return (
        <>
            <div className={styles.legend}>
                <h1 className={styles.header}>Legend</h1>
                <hr className={styles.divider}/>
                <div className={styles.legendItem}>
                    <IoLocationSharp className={styles.icon} size={20}/>
                    <p>Project Points</p>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.line} ${styles.grow}`}/>
                    <p> Growth Projects</p>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.line} ${styles.modernize}`}/>
                    <p> Modernize Projects</p>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.line} ${styles.maintain}`}/>
                    <p> Maintain Projects</p>
                </div>
            </div>
        </>
    )
}

export default Legend;