import sys
import os
import re
import json
import requests
import webbrowser
import pandas as pd
import tldextract
from collections import defaultdict
from PySide6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFileDialog, QListWidget,
    QTableWidget, QTableWidgetItem, QProgressBar,
    QMessageBox, QLineEdit, QStatusBar, QMenu
)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QAction, QIcon


# ===============================
# CONFIG
# ===============================

APP_NAME = "KeySort"
APP_VERSION = "1.0.0"
SETTINGS_FILE = "keysort_settings.json"

GITHUB_REPO = "AA-Studio99/keysort"
GITHUB_API_URL = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"


# ===============================
# RESOURCE PATH (FOR EXE/MSI)
# ===============================

def resource_path(relative_path):
    if hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(os.path.abspath("."), relative_path)


class KeySort(QWidget):

    def __init__(self):
        super().__init__()

        self.setWindowTitle(f"{APP_NAME} v{APP_VERSION}")
        self.setWindowIcon(QIcon(resource_path("keysort.ico")))
        self.setMinimumSize(1200, 750)

        self.files = []
        self.export_folder = os.getcwd()
        self.preview_rows = []
        self.password_visible = True

        self.init_ui()
        self.check_local_version_update()
        self.check_github_update()

    # ===============================
    # VERSION SYSTEM
    # ===============================

    def check_local_version_update(self):
        previous_version = None

        if os.path.exists(SETTINGS_FILE):
            try:
                with open(SETTINGS_FILE, "r") as f:
                    data = json.load(f)
                    previous_version = data.get("version")
            except:
                previous_version = None

        if previous_version and previous_version != APP_VERSION:
            QMessageBox.information(
                self,
                f"{APP_NAME} Updated",
                f"Updated from {previous_version} → {APP_VERSION}"
            )

        try:
            with open(SETTINGS_FILE, "w") as f:
                json.dump({"version": APP_VERSION}, f)
        except:
            pass

    def check_github_update(self):
        try:
            response = requests.get(GITHUB_API_URL, timeout=5)
            if response.status_code == 200:
                data = response.json()
                latest_version = data["tag_name"].replace("v", "")
                if latest_version != APP_VERSION:
                    self.show_update_banner(latest_version, data["html_url"])
        except:
            pass

    def show_update_banner(self, latest_version, release_url):
        banner = QLabel(
            f"🔔 Update available: {APP_VERSION} → {latest_version}  |  Click to download"
        )
        banner.setStyleSheet("""
            background-color: #2d8cff;
            padding: 8px;
            font-weight: bold;
        """)
        banner.setAlignment(Qt.AlignCenter)
        banner.mousePressEvent = lambda event: webbrowser.open(release_url)
        self.layout().insertWidget(0, banner)

    # ===============================
    # UI
    # ===============================

    def init_ui(self):
        layout = QVBoxLayout()

        title = QLabel(f"🔐 {APP_NAME}")
        title.setStyleSheet("font-size:30px; font-weight:bold;")
        layout.addWidget(title)

        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search site, domain, username or password...")
        self.search_input.textChanged.connect(self.filter_table)
        layout.addWidget(self.search_input)

        button_layout = QHBoxLayout()

        self.add_btn = QPushButton("Add CSV Files")
        self.add_btn.clicked.connect(self.add_files)
        button_layout.addWidget(self.add_btn)

        self.remove_btn = QPushButton("Remove Selected")
        self.remove_btn.clicked.connect(self.remove_selected)
        button_layout.addWidget(self.remove_btn)

        self.export_btn = QPushButton("Choose Export Folder")
        self.export_btn.clicked.connect(self.choose_export_folder)
        button_layout.addWidget(self.export_btn)

        self.eye_btn = QPushButton("👁")
        self.eye_btn.setFixedWidth(40)
        self.eye_btn.clicked.connect(self.toggle_password_visibility)
        button_layout.addWidget(self.eye_btn)

        layout.addLayout(button_layout)

        self.file_list = QListWidget()
        layout.addWidget(self.file_list)

        self.table = QTableWidget()
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(
            ["Site", "Domain", "Username/Email", "Password"]
        )
        self.table.setSortingEnabled(True)
        self.table.cellClicked.connect(self.handle_cell_click)
        self.table.setContextMenuPolicy(Qt.CustomContextMenu)
        self.table.customContextMenuRequested.connect(self.open_context_menu)
        layout.addWidget(self.table)

        self.progress = QProgressBar()
        layout.addWidget(self.progress)

        self.compile_btn = QPushButton("Compile & Preview")
        self.compile_btn.clicked.connect(self.compile_passwords)
        layout.addWidget(self.compile_btn)

        self.export_compiled_btn = QPushButton("Export Compiled Passwords")
        self.export_compiled_btn.clicked.connect(self.export_compiled_passwords)
        layout.addWidget(self.export_compiled_btn)

        self.status_bar = QStatusBar()
        layout.addWidget(self.status_bar)

        self.setLayout(layout)

        self.setStyleSheet("""
            QWidget { background-color: #121212; color: white; }
            QPushButton { background-color: #1f6feb; padding: 8px; border-radius: 6px; }
            QPushButton:hover { background-color: #2d8cff; }
            QListWidget, QTableWidget, QLineEdit { background-color: #1e1e1e; color: white; }
            QHeaderView::section { background-color: #2a2a2a; }
        """)

    # ===============================
    # STATUS FADE
    # ===============================

    def show_status_message(self, message):
        self.status_bar.showMessage(message)
        QTimer.singleShot(2000, lambda: self.status_bar.clearMessage())

    # ===============================
    # FILE HANDLING
    # ===============================

    def add_files(self):
        files, _ = QFileDialog.getOpenFileNames(
            self, "Select CSV Files", "", "CSV Files (*.csv)"
        )
        for file in files:
            if file not in self.files:
                self.files.append(file)
                self.file_list.addItem(file)

    def remove_selected(self):
        selected = self.file_list.currentRow()
        if selected >= 0:
            self.files.pop(selected)
            self.file_list.takeItem(selected)

    def choose_export_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "Select Export Folder")
        if folder:
            self.export_folder = folder

    # ===============================
    # UTILITIES
    # ===============================

    def extract_site_info(self, url):
        ext = tldextract.extract(str(url))
        domain = ext.domain.capitalize() if ext.domain else "Unknown"
        full_domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain
        return domain, full_domain

    def detect_column(self, columns, keywords):
        for key in keywords:
            for col in columns:
                if key in col:
                    return col
        return None

    # ===============================
    # CORE LOGIC
    # ===============================

    def compile_passwords(self):

        if not self.files:
            QMessageBox.warning(self, "Error", "No CSV files selected.")
            return

        self.progress.setValue(0)
        QApplication.processEvents()

        all_entries = []

        for index, file in enumerate(self.files):
            try:
                df = pd.read_csv(file)
                df.columns = [c.lower() for c in df.columns]

                url_col = self.detect_column(df.columns, ["url", "origin", "hostname"])
                user_col = self.detect_column(df.columns, ["username", "user", "login"])
                pass_col = self.detect_column(df.columns, ["password", "pwd"])

                if not url_col or not user_col or not pass_col:
                    continue

                for _, row in df.iterrows():
                    domain, full_domain = self.extract_site_info(row[url_col])
                    username = str(row[user_col]).strip()
                    password = str(row[pass_col]).strip()

                    if username and password:
                        all_entries.append((domain, full_domain, username, password))

            except:
                pass

            self.progress.setValue(int((index + 1) / len(self.files) * 60))
            QApplication.processEvents()

        grouped = defaultdict(list)

        for domain, full_domain, username, password in all_entries:
            grouped[(domain, full_domain, username)].append(password)

        final_data = defaultdict(list)

        for (domain, full_domain, username), passwords in grouped.items():
            merged = " | ".join(sorted(set(passwords)))
            final_data[(domain, full_domain)].append((username, merged))

        sorted_sites = sorted(final_data.keys(), key=lambda x: x[0].lower())

        self.preview_rows = []
        rows = sum(len(final_data[k]) for k in sorted_sites)
        self.table.setRowCount(rows)

        row_index = 0
        for (domain, full_domain) in sorted_sites:
            accounts = sorted(final_data[(domain, full_domain)], key=lambda x: x[0].lower())
            for username, password in accounts:
                self.preview_rows.append((domain, full_domain, username, password))

                display_password = password if self.password_visible else "••••••••"
                display_password += "   📋"

                self.table.setItem(row_index, 0, QTableWidgetItem(domain))
                self.table.setItem(row_index, 1, QTableWidgetItem(full_domain))
                self.table.setItem(row_index, 2, QTableWidgetItem(username))
                self.table.setItem(row_index, 3, QTableWidgetItem(display_password))
                row_index += 1

        self.progress.setValue(100)
        QApplication.processEvents()
        self.show_status_message("Preview updated ✓")

    def export_compiled_passwords(self):

        if not self.preview_rows:
            QMessageBox.warning(self, "Error", "No compiled data to export.")
            return

        file_path, selected_filter = QFileDialog.getSaveFileName(
            self,
            "Export Compiled Passwords",
            os.path.join(self.export_folder, "compiled_passwords.csv"),
            "CSV Files (*.csv);;Text Files (*.txt)"
        )

        if not file_path:
            return

        try:
            if file_path.endswith(".csv"):
                df = pd.DataFrame(
                    self.preview_rows,
                    columns=["Site", "Domain", "Username/Email", "Password"]
                )
                df.to_csv(file_path, index=False)

            elif file_path.endswith(".txt"):
                with open(file_path, "w", encoding="utf-8") as f:
                    for domain, full_domain, username, password in self.preview_rows:
                        f.write(f"{domain} ({full_domain}) | {username} | {password}\n")

            self.show_status_message("Export successful ✓")

        except Exception as e:
            QMessageBox.critical(self, "Export Failed", str(e))

    # ===============================
    # CLIPBOARD
    # ===============================

    def copy_to_clipboard(self, text):
        QApplication.clipboard().setText(text)
        self.show_status_message("Copied ✓")

    def handle_cell_click(self, row, column):
        if column == 3:
            self.copy_to_clipboard(self.preview_rows[row][3])

    # ===============================
    # SEARCH
    # ===============================

    def filter_table(self):
        query = self.search_input.text().lower()

        filtered = [
            row for row in self.preview_rows
            if query in row[0].lower()
            or query in row[1].lower()
            or query in row[2].lower()
            or query in row[3].lower()
        ]

        self.table.setRowCount(len(filtered))

        for row_index, (domain, full_domain, username, password) in enumerate(filtered):
            display_password = password if self.password_visible else "••••••••"
            display_password += "   📋"

            self.table.setItem(row_index, 0, QTableWidgetItem(domain))
            self.table.setItem(row_index, 1, QTableWidgetItem(full_domain))
            self.table.setItem(row_index, 2, QTableWidgetItem(username))
            self.table.setItem(row_index, 3, QTableWidgetItem(display_password))

    # ===============================
    # VISIBILITY
    # ===============================

    def toggle_password_visibility(self):
        self.password_visible = not self.password_visible
        self.eye_btn.setText("👁" if self.password_visible else "🚫")
        self.filter_table()

    # ===============================
    # CONTEXT MENU
    # ===============================

    def open_context_menu(self, position):
        row = self.table.currentRow()
        if row < 0:
            return

        menu = QMenu()

        copy_password = QAction("Copy Password", self)
        copy_username = QAction("Copy Username", self)
        copy_site = QAction("Copy Site", self)

        menu.addAction(copy_password)
        menu.addAction(copy_username)
        menu.addAction(copy_site)

        action = menu.exec_(self.table.viewport().mapToGlobal(position))

        if action == copy_password:
            self.copy_to_clipboard(self.preview_rows[row][3])
        elif action == copy_username:
            self.copy_to_clipboard(self.preview_rows[row][2])
        elif action == copy_site:
            self.copy_to_clipboard(self.preview_rows[row][0])


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = KeySort()
    window.show()
    sys.exit(app.exec())