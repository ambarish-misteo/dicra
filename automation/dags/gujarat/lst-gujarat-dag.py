from __future__ import annotations

import datetime
import os
import pendulum

from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.empty import EmptyOperator

with DAG(
    dag_id="lst_gujarat_dag.py",
    schedule="@monthly",
    start_date=pendulum.datetime(2023, 1, 1, tz="UTC"),
    catchup=False,
    dagrun_timeout=datetime.timedelta(minutes=60),
    tags=["lst", "gujarat"],
) as dag:

    run_this_last = EmptyOperator(
        task_id="run_this_last",

    )

    # [START howto_operator_bash]
    download_path = "/opt/airflow/dags/scripts/gujarat/lst-gujarat-download.py"
    download_command = "python3 " + download_path
    if os.path.exists(download_path):
        download_data = BashOperator(
            task_id="download_data",
            bash_command=download_command,
            dag=dag
        )
    else:
        raise Exception("Cannot locate {}".format(download_path))
    # [END howto_operator_bash]

       # [START howto_operator_bash]
    process_path = "/opt/airflow/dags/scripts/gujarat/lst-gujarat-preprocess.py"
    process_command = "python3 " + process_path
    if os.path.exists(process_path):
        process_data = BashOperator(
            task_id="process_data",
            bash_command=process_command,
            dag=dag
        )
    else:
        raise Exception("Cannot locate {}".format(process_command))

    # [END howto_operator_bash]


    download_data >> process_data >> run_this_last

if __name__ == "__main__":
    dag.test()