<template>
  <div class="addClass">

    <section class="data_section">

      <el-dialog
        width="30%"
        title="添加组"
        :visible.sync="innerDialogVisible"
        append-to-body>
        组名：<el-input v-model="addNewGroupName" style="width: 30%"></el-input>
        <el-button type="primary" @click="addGroupNameHandle()">确定</el-button>
      </el-dialog>
      <el-form  :model="sourceLists" :label-width="formLabelWidth">
        <el-row>
          <el-col :span="24">
            <el-card class="box-card">
              <div class="rowBox cardTop">
                <el-form-item label="课程名称:">
                  <span v-if="editClassFlag">
                    <el-input v-model="sourceLists.classList.name" ></el-input>
                  </span>
                  <span v-else>{{sourceLists.classList.name}}</span>
                </el-form-item>
                <el-form-item label="课程目标:">
                  <span v-if="editClassFlag">
                    <el-input type="textarea" v-model="sourceLists.classList.target"></el-input>
                  </span>
                  <span v-else>{{sourceLists.classList.target}}</span>
                </el-form-item>
                <el-form-item label="课程时长:">
                  <span v-if="editClassFlag">
                    <el-input v-model="sourceLists.classList.duration"></el-input>
                  </span>
                  <span v-else>{{sourceLists.classList.duration}}</span>
                </el-form-item>
                <el-form-item label="对应版本:">
                  <span v-if="editClassFlag">
                    <el-input v-model="sourceLists.classList.version"></el-input>
                  </span>
                  <span v-else>{{sourceLists.classList.version}}</span>
                </el-form-item>
                <el-form-item>
                  <div class="button-group">
                    <span>
                        <el-button size="mini" @click="addCustomBlock">添加自定义区块</el-button>
                        <el-button size="mini" @click="DialogIdiilVisible = true;">添加IDIIL区块</el-button>
                    </span>
                    <span>
                        <el-button size="mini" @click="editClass">编辑</el-button>
                        <el-button size="mini" @click="saveClass">保存hhhghhh</el-button>
                    </span>
                  </div>
                </el-form-item>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row>
          <el-col>
            <!--<el-collapse>-->
              <draggable
                tag="el-collapse"
                :list="sourceLists.blockLists"
              >
                <div v-for="(blockList,index) in sourceLists.blockLists" :key="blockList.key" class="collapseItem">
                  <el-collapse-item v-if="blockList.type == 'custom'" >
                    <template slot="title">
                      自定义区块课程{{blockList.key}}
                      <!--<i class="el-icon-xiayi moveUp" @click.stop="moveUp($event)"></i>-->
                      <!--<i class="el-icon-xiayi1 moveDown" @click.stop="moveDown($event)"></i>-->
                    </template>
                    <custom-list :blockLists="sourceLists.blockLists" :blockList="blockList"></custom-list>

                  </el-collapse-item>
                  <el-collapse-item v-else>
                    <template slot="title">
                      IDIIL线上英语课程{{blockList.key}}
                    </template>
                    <default-list :blockLists="sourceLists.blockLists" :blockList="blockList"></default-list>
                  </el-collapse-item>
                </div>
              </draggable>
            <!--</el-collapse>-->
          </el-col>
        </el-row>
      </el-form>

      <div style="margin-top: 50px;">
        <el-button type="primary" @click="submitAllData">提 交{{count}}</el-button>
      </div>
    </section>
    <el-dialog
      width="60%"
      title="添加课程"
      :visible.sync="DialogIdiilVisible"
      :close-on-click-modal="false"
      append-to-body
      v-if='DialogIdiilVisible'>
      <select-class v-on:selectClassHandle="selectClassHandle"></select-class>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapState,mapMutations } from 'vuex'
  import headTop from '../../components/headTop.vue'
  import selectClass from '../../components/selectClassDom.vue'
  import classData from '../../data/classlist'
  import {getNowFormatDate,filterWebUrl,toJson} from '../../config/methods'
  import {setStore,getStore} from '../../config/publicMethod'
  import {uploadFile} from '../../api/upload'
  import {addClassListInfo,updateClassListInfo} from '../../api/classes'
  import {getAllClassesOfCenter} from '../../api/manage'
  import {getOnLineData} from '../../api/exploration'
  import customList from '../../components/customList.vue'
  import defaultList from '../../components/defaultList.vue'
  import draggable from 'vuedraggable'
  let Base64 = require('js-base64').Base64;

  export default {
    props:['data','type','addFlag'],
    data(){
      let classData1 = JSON.stringify(classData);
      return {
        studentData: [],
        studentAllData: [],//学生的总列表，一直不变 在重置的时候需要
        direction:'',//学生分组方向
        activeNames: ['1'],
        innerDialogVisible:false,
        DialogIdiilVisible:false,
        formLabelWidth: '90px',
        addNewGroupName:'',
        classOptions:[],
        editClassFlag:false,
        sourceLists:{}

      }
    },
    created(){
      //在页面加载时读取localStorage里的状态信息
      const object2 = Object.assign({}, this.sourceListsInfo);
      console.log(object2);
      const object=JSON.parse(JSON.stringify(this.sourceListsInfo));
      this.sourceLists=JSON.parse(getStore("sourceLists")) || object;
      console.log('1111111111111111'+this.sourceLists)
    },
    computed: {
      ...mapState(['sourceListsInfo','count']),
      sourceData() {
        let changeValue = this.form.studentGroup.nowList;
        return this.studentData.filter(item => changeValue.indexOf(item.key) === -1);
      }
    },
    watch:{
      //当监听的属性值变化的时候 会执行对应的处理逻辑
      addFlag:function(newValue,oldValue){
        console.error("watch 监听数据-----》",newValue,oldValue);

      },
      $route:function(to,from){
        console.error("watch 监听数据--$route--11-》",to,from)
      },
      '$route' (to, from) {
        console.error("watch 监听数据--$route--22-》",to,from)
      },
      beforeRouteUpdate (to, from, next) {
        console.error("watch 监听数据--beforeRouteUpdate--33-》",to,from)
      }
    },

    components:{
      headTop,
      draggable,
      selectClass,
      customList,
      defaultList
    },
    mounted(){

      const Wh = $(window).height();
      console.log('222222222222--->',this.data,this.type);
      this.getclassesList();
      this.setItemDisabled();

      fetch('static/ClassUserList.json').then((response)=>{
        return response.json();
      }).then((res)=>{
        if(this.type == 'update'){
          this.form.studentGroup = toJson(this.data.group_student_Info);
          this.sourceLists.blockLists = toJson(this.data.source);//之前的idiil课件list
          this.fileList = toJson(this.data.otherSource);//之前的上传文件
          this.form.otherSource = toJson(this.data.otherSource);//之前的上传文件
          this.form.source = toJson(this.data.source);//之前的上传文件
          this.form.name = this.data.name;//之前的上传文件
          this.form.target = this.data.target;//之前的上传文件
          this.form.commits = this.data.commits;//之前的上传文件
          this.form.courseId = this.data.courseId;//之前的上传文件
          this.form.classId = this.data.classId;//之前的上传文件
        }else {
          this.studentData = res.StudentList;
          this.studentAllData = res.StudentList;
          console.warn("获取学生数据:::::",this.studentData)
        }
      }).catch(()=>{
        console.error("获取学生数据出错")
      })
    },
    methods: {
      ...mapMutations([
        'ADD_COUNT',
        'SOURCE_LIST'// 将 `this.classList()` 映射为 `this.$store.commit('increment')`//将 `this.blockList(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
      ]),
      async getclassesList(){
        let result1 = await getAllClassesOfCenter({centerId:'002'});
        console.log("班级列表--------------------->",result1);


        if(result1.code == 200){
          this.classOptions = result1.data;
        }
      },

      async getBlockNum(param){
        const onlinePra={FileName:'Math--'+param,Action:'get',Content:'',Function:'OnlineMathBaseData'};
        let result2=await getOnLineData(onlinePra);
        result2=JSON.parse(Base64.decode(result2));
        console.log(result2);
      },
      handleChange(value, direction, movedKeys) {
        console.log("studentData", this.studentData);
        console.log("value", value);
        console.log("direction", direction);
        console.log("movedKeys", movedKeys);
        this.direction = direction;
        this.form.studentGroup.nowList = value;
      },
      // 确定按钮 --往组里面加数据
      addGroupData(){
        let form = this.form;
        let endnowList = this.filterNowList(form.studentGroup.nowList);//选中的学生列表，要添加到组里面的
        let nowgroupname = form.studentGroup.nowGroup[1];//当前修改的是哪一个组
        let group = form.studentGroup.groups;//当前所有组的信息
        if($.inArray(nowgroupname,form.studentGroup.groupArray) != -1){//已存在
          for(let ii in group){
            if(group[ii].name == nowgroupname){//改组已经存在 则修改
              form.studentGroup.groups[ii].studentItem = form.studentGroup.groups[ii].studentItem.concat(endnowList);
            }
          }
        }else {
          form.studentGroup.groupArray.push(nowgroupname)
          form.studentGroup.groups.push({
            name:nowgroupname,
            studentItem : endnowList
          })
        }
        this.studentData = this.sourceData;//移除后的学生列表数组 赋值给 学生源数组
      },
      // 从新分组
      resize(){
        console.log("删除组--",this.form.studentGroup,this.studentAllData);
        this.form.studentGroup = {
          groupArray:[],//创建的组
          nowGroup:['学生列表','默认组'],//当前正在修改的组
          nowList:[],//当前正在修改的组的数据
          nowStudentData:[],
          groups:[]
        }
        this.studentData = this.studentAllData;//重置
      },
      //修改某个组的成员
      editGroup(item,index){
        console.log("编辑组",item.name,index);
        this.form.studentGroup.nowGroup.splice(1,1,item.name);//由于vue修改数组中的某个值不会触发更新。所以使用splice来返回新的数组
        let studentitem = this.form.studentGroup.groups[index].studentItem;//要编辑的组的学生列表
        let nowList=[];
        for(let ii in studentitem){
          nowList.push(studentitem[ii].key)
        }
        this.form.studentGroup.nowList = nowList;
        this.studentData = this.studentData.concat(studentitem);
        this.form.studentGroup.groups[index].studentItem = [];//修改的时候 把组内的学生删除了
        console.log(this.form.studentGroup.nowList,this.studentData)
      },
      //新加学生分组组名的判断函数
      addGroupNameHandle(){
        if($.inArray(this.addNewGroupName,this.form.studentGroup.groupArray) != -1){//已存在
          return this.$alert('提示：改组已经存在，请重新输入组名！')
        }
        this.innerDialogVisible = false;
        this.form.studentGroup.nowList = [];//清空分组框中的内容
        this.form.studentGroup.nowGroup.splice(1,1,this.addNewGroupName);
        this.form.studentGroup.groupArray.push(this.addNewGroupName);//添加新的组名
        this.form.studentGroup.groups.push({
          name:this.addNewGroupName,
          studentItem : []
        })
        console.log("添加的新租、",this.addNewGroupName)
      },

      //全部提交按钮事件
      async submitAllData(){
        let userInfo = JSON.parse(getStore('userInfo'));
        this.form.source = this.sourceLists.blockLists;
        this.form.datetime = getNowFormatDate.YY_MM_DD();
        this.form.teacherId = userInfo.userId;
        this.form.teacherName = userInfo.userName;
        this.form.centerId = userInfo.centerId;
        this.form.subjectName = '数学';
        if(this.form.name=='' || this.form.target=='' || this.form.source.length==0 ){
          return this.$alert("课程名、教学目标、教学资源等内容不能为空！")
        }
        console.log("提交所有的数据",this.form,this.type)
        let classList = JSON.parse(getStore("classList"));
        classList.push(this.form);
        if(this.type == 'add'){
          const  result = await addClassListInfo(this.form)//存入数据库
          setStore("classList",JSON.stringify(classList))//存放在本地缓存里面
          this.$message({message: '提交成功！',type:'success'});
        }else if(this.type == 'update'){
          const  result = await updateClassListInfo(this.form)
          this.$message({message: '修改成功！',type:'success'});
        }else {
          this.$message({message: '没有操作类型,什么都没有做^—^！',type:'warning'});
        }
      },

      //选择完课程之后的处理逻辑
      selectClassHandle(param){
        let ClassUserInfo = JSON.parse(getStore("ClassUserList"));
        let UserInfo = JSON.parse(getStore("userInfo"));
        console.log("选择的链接---》",ClassUserInfo,ClassUserInfo.CenterID);
        let objParam={
          sChapterID:param.CID,
          sUnitID:param.UID,
          sChapterName:param.ChapterName,
          sUnitName:param.UnitName,
          sDirName:param.DirName,
          sCenterID : ClassUserInfo.CenterID,
          sCenterWeb : ClassUserInfo.CenterWeb,
          sMainWeb : ClassUserInfo.MainWeb,
          sAssignID : ClassUserInfo.ClassID,
          sPerformanceID : ClassUserInfo.ClassID,
          InstructorID : UserInfo.InstructorID,
          OutputType:param.selectType,
          GlobalID:param.GlobalID
        };
        let urlJson= {
          name:param.selectUnitName,
          target:"2222",
          duration:'100分钟',
          params:objParam,
          type:"class",
          uid: new Date().getTime(),
          key: Date.now()
        };
        this.sourceLists.blockLists.push(urlJson);

        this.getBlockNum(param.GlobalID);
        this.$message({'type':'success',message:"添加成功！"})
      },
      //获取选中的学生的信息
      filterNowList(data){
        let result = [];
        for(let ii in data){
          for(let jj in this.studentData){
            if(this.studentData[jj].key == data[ii]){
              result.push(this.studentData[jj])
            }
          }
        }
        return result
      },
      //添加区块
      addCustomBlock(param){
        let urlJson= {
          name:"",
          target:"",
          duration:'50分钟',
          type:"custom",
          params:"custom",
          uid: new Date().getTime(),
          key: Date.now()
        };
        this.sourceLists.blockLists.push(urlJson);
        this.$nextTick(function(){this.setItemDisabled()})
      },
      alertFn(num){
        alert(num)

      },
      editClass(){
        this.editClassFlag=true;
      },
      saveClass(){
        this.editClassFlag=false;
        console.log(this.sourceLists);
        this.SOURCE_LIST(this.sourceLists);
        this.ADD_COUNT();
      },


      //设置上移下移按钮的状态
      setItemDisabled(){
        $("i.moveUp,i.moveDown").show();
        $("div[role=tab]:first").find(".moveUp").hide();
        $("div[role=tab]:last").find(".moveDown").hide();
      },
      //上移区块
      moveUp(btn){
        var thisIndex=$("div[role=tab]").index($(btn.target).parents("div[role=tab]").eq(0));
        if(thisIndex!=0){
          $("div[role=tab]").eq(thisIndex-1).parent().parent().before($(btn.target).parents("div.el-collapse-item").eq(0).parent())
        }
        this.setItemDisabled()
      },
      //下移区块
      moveDown(btn){
        var thisIndex=$("div[role=tab]").index($(btn.target).parents("div[role=tab]").eq(0));
        if(thisIndex!=$("div[role=tab]").length-1){
          $("div[role=tab]").eq(thisIndex+1).parent().parent().after($(btn.target).parents("div.el-collapse-item").eq(0).parent())
        }
        this.setItemDisabled()
      }
    }
  }
</script>

<style scoped  lang="less" type="text/less">

  i{
    font-size: 16px;
    padding-left: 15px;
  }
  .addClass{
  .data_section {
    padding: 20px;
    margin-bottom: 40px;
    text-align: left;
  .el-row{
    margin-bottom: 25px;
  }
  .collapseItem{
    border-bottom: 1px solid #ebeef5;
  }
  .cardTop,.cardBody {

    color: #000000;
  .button-group{
    text-align: right;
    margin: 0;
    display: flex;
    justify-content: space-between;
  }
  }

  .righttable table{
    border: 1px solid #999;
  tr td{
    border-top: 0;
    border-right: 1px solid #999;
    border-bottom: 1px solid #999;
    border-left: 0;

  }
  }
  .transfer-footer {
    margin-left:10px;
    padding: 6px 5px;
  }
  .el-tag{
    margin: 0 3px;
  }
  .tianjiazu{
    float: right;
    margin: 6px 0 0 5px;
  }
  }
  }
</style>
