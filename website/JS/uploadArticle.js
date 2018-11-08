/**
 * Created by cabbage on 17/05/26.
 */
window.onload = function () {
    Bmob.initialize("ed4aedea541215a93b483fbe0e9c8bc3", "bcfdb82a2462b1e83a535b77ca8104ff");
    if(Bmob.User.current()){
        if(Bmob.User.current().get("authority")<100)window.open("login.html","_self");else{

            var types = Bmob.Object.extend("Types");
            var query = new Bmob.Query(types);
            //设置查询对象
            // 查询所有数据
            query.find({
                success: function(results) {
                    for (var i = 0; i < results.length; i++) {
                        var object = results[i];
                        document.getElementById("type").options.add(new Option(object.get("typeName"),object.get("typeName")))
                    }
                },
                error: function(error) {
                    alert("查询失败: " + error.code + " " + error.message);
                }
            });



            document.getElementById("upload").onclick = function () {

                //获取云表各列所需要的数据 创建Object
                var title = document.getElementById("title").value;
                var content = ue.getContent();
                var selector = document.getElementById("authority");
                var autho = selector.selectedIndex;
                var selector1 = document.getElementById("type");
                var newTYPE = document.getElementById("newType");
                var index=selector1.selectedIndex;//获取被选中的option的索引
                var text= selector1.options[index].value;//获取相应的option的内容
                var typeSelected = selector1.options[index].text;
                var intro = document.getElementById("intro").value;
                if(text.trim()=="new"){
                    if(newTYPE.value.trim()==""){alert("请选择或新建一个分类");return;}
                    typeSelected = newTYPE.value;
                    var TypeObject = Bmob.Object.extend("Types");
                    var tp = new TypeObject();
                    tp.set("typeName",newTYPE.value);
                    tp.save(null, {
                        success: function(object) {
                            alert("成功创建新分类");
                        },
                        error: function(model, error) {
                            alert("创建新分类失败");
                        }
                    });
                }

                //判断是否空标题内容
                if(title==""||content.trim()==""||intro==""){
                    alert("文章标题或内容以及简介不能为空");
                    return;
                }
                //创建对象上传内容
                var Article = Bmob.Object.extend("Articles");
                var article = new Article();
                var d1=new Date("2004/09/16 20:08:00");
                var d2=new Date();
                article.set("title",title);
                article.set("content",content);
                article.set("requestAuthority",autho);
                article.set("type",typeSelected);
                article.set("view",0);
                article.set("comments",0);
                article.set("timeDistant",d2-d1);
                article.set("intro",intro);
                article.save(null, {
                    success: function(object) {
                        alert("成功上传");
                        window.open("upload.html","_self")
                    },
                    error: function(model, error) {
                        alert("上传发生未知错误请确保文章名唯一");
                    }
                });
            }
        }
    }
    else(window.open("login.html","_self"));  //检查是否有进入后台得到权限  如果没有相应权限就回到登录页


};