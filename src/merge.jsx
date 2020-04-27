import React from "react";
import ReactDOM from "react-dom";
import { Button, Table, Input, message, Modal } from "antd";
import {
  DiffOutlined,
  PlusOutlined,
  FullscreenExitOutlined,
  SortDescendingOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { ipcRenderer, remote, shell } from "electron";
import lpFileNameSort from "lp-file-name-sort/dist/index.esm.js";
import "./merge.less";

const SUPORT_INPUT_EXT = ["ts", "mp4", "mov", "avi", "mkv"];

export default class Merge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDropMask: false,
      fileList: [],
      cliContent: "控制台信息：",
    };
  }

  handleAddBtnClick() {
    remote.dialog
      .showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [{ name: "视频格式", extensions: SUPORT_INPUT_EXT }],
      })
      .then((result) => {
        if (!result.filePaths.length) {
          return;
        }
        this.setState({
          fileList: result.filePaths.map((item, key) => ({
            name: item,
            num: key + 1,
          })),
        });
      });
  }

  handleMegeBtnClick() {
    const { fileList } = this.state;

    if (!fileList.length) {
      message.warning("还没有添加文件~", 1);
      return;
    }

    remote.dialog
      .showSaveDialog({
        title: "保存",
        defaultPath: "合并影片",
        filters: [
          { name: "MKV", extensions: ["mkv"] },
          { name: "MP4", extensions: ["mp4"] },
          { name: "TS", extensions: ["TS"] },
        ],
      })
      .then((result) => {
        if (result.filePath) {
          this.setState({
            cliContent: "控制台信息：\n",
          });
          ipcRenderer.send("merge-merge", {
            input: fileList.map((item) => item.name).join("|"),
            output: result.filePath,
          });
        }
      });
  }

  handleFileSort() {
    this.setState({
      fileList: this.state.fileList
        .sort((a, b) => lpFileNameSort(a.name, b.name))
        .map((item, key) => ({
          ...item,
          num: key + 1,
        })),
    });
  }

  handleDropLeave(e) {
    e.preventDefault();
    e.stopPropagation();

    !this.state.showDropMask ||
      this.setState({
        showDropMask: false,
      });
  }

  handleBtnGithub() {
    shell.openExternal("https://github.com/lecepin");
  }

  componentDidMount() {
    window.addEventListener(
      "dragenter",
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        this.state.showDropMask ||
          this.setState({
            showDropMask: true,
          });
      },
      false
    );
    window.addEventListener(
      "dragover",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
      },
      false
    );
    window.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();

      this.setState({
        showDropMask: false,
      });

      const dropfiles = [];

      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        let item = e.dataTransfer.items[i];
        if (item.kind === "file") {
          let filename = item.getAsFile().name;
          let ext = filename.substr(filename.lastIndexOf(".") + 1);
          SUPORT_INPUT_EXT.includes(ext) && dropfiles.push(item.getAsFile());
        }
      }
      dropfiles.length &&
        this.setState({
          fileList: dropfiles.map((item, key) => ({
            name: item.path,
            num: key + 1,
          })),
        });
    });

    ipcRenderer.on("merge-merge-result", (event, arg) => {
      // console.log(arg);
      if (arg.type == "err") {
        Modal.error({
          title: "错误",
          content: (
            <div>
              当前系统未安装ffmpeg，请在终端中执行：“brew install ffmpeg”
              进行安装~
            </div>
          ),
        });
      }

      if (arg.data.indexOf("muxing overhead") > -1) {
        message.success("操作完成", 1);
      }

      this.setState(
        {
          cliContent: this.state.cliContent + arg.data + "\n",
        },
        () => {
          if (this.refConsole) {
            this.refConsole.scrollTop = this.refConsole.scrollHeight;
          }
        }
      );
    });
  }

  render() {
    const { showDropMask, fileList, cliContent } = this.state;
    return (
      <div className="Merge">
        {showDropMask && (
          <div
            className="Merge-drop"
            onDragLeave={(e) => this.handleDropLeave(e)}
          >
            <DiffOutlined style={{ fontSize: 150 }} />
            <div>添加文件</div>
          </div>
        )}
        <div className="Merge-btns">
          <Button
            type="primary"
            ghost
            icon={<PlusOutlined />}
            onClick={() => this.handleAddBtnClick()}
          >
            添加文件
          </Button>
          <Button
            type="primary"
            ghost
            icon={<SortDescendingOutlined />}
            onClick={() => this.handleFileSort()}
          >
            排序
          </Button>
          <Button
            type="primary"
            ghost
            icon={<FullscreenExitOutlined />}
            onClick={() => this.handleMegeBtnClick()}
          >
            合并
          </Button>
          <div className="Merge-github" onClick={() => this.handleBtnGithub()}>
            <GithubOutlined title="访问Github" />
          </div>
        </div>
        <div>
          <Table
            dataSource={fileList}
            columns={[
              {
                title: "",
                dataIndex: "num",
                width: 50,
              },
              {
                title: "文件列表",
                dataIndex: "name",
              },
            ]}
            size="small"
            pagination={false}
            scroll={{ y: 240 }}
            locale={{
              emptyText: "还没有添加文件~",
            }}
          ></Table>
        </div>
        {(fileList.length && (
          <div className="Merge-file-len">共{fileList.length}个文件</div>
        )) ||
          ""}
        <div className="Merge-console">
          <Input.TextArea
            rows={8}
            value={cliContent}
            ref={(_ref) => (this.refConsole = ReactDOM.findDOMNode(_ref))}
          ></Input.TextArea>
        </div>
      </div>
    );
  }
}
