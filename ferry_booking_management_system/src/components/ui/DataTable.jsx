import React, { useEffect } from 'react';
import $ from 'jquery';
import 'datatables.net-dt/css/jquery.dataTables.min.css';
import 'datatables.net';

const DataTable = ({ id, children }) => {
  useEffect(() => {
    const table = $(`#${id}`).DataTable({
      responsive: true,
      pageLength: 25,
      language: {
        search: "Cari:",
        lengthMenu: "Tampilkan _MENU_ entri",
        info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ entri",
        infoEmpty: "Menampilkan 0 sampai 0 dari 0 entri",
        infoFiltered: "(disaring dari _MAX_ total entri)",
        paginate: {
          first: "Pertama",
          last: "Terakhir",
          next: "Selanjutnya",
          previous: "Sebelumnya"
        }
      }
    });

    return () => {
      if ($.fn.DataTable.isDataTable(`#${id}`)) {
        table.destroy();
      }
    };
  }, [id]);

  return (
    <table id={id} className="min-w-full divide-y divide-gray-200">
      {children}
    </table>
  );
};

export default DataTable;