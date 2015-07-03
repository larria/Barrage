/*
 * Class Barrage
 * @param  {[type]} opts [description]
 * @author : Zhong Yuan 2015.4.7
 * @version : v0.99 beta
 */
var Barrage = function() {
    var init = function(opts) {
        this._initConf(opts);
        this._initDoms();
    };
    init.prototype = {
        // utils
        _id : function (id) {
            return document.getElementById(id);
        },
        _class : function (searchClass, node, tag) {
            var classElements = [],
                els, elsLen, pattern;
            if(node == null) node = document.body;
            if(tag == null) tag = '*';
            if(node.getElementsByClassName){
                return node.getElementsByClassName(searchClass);
            }
            if(node.querySelectorAll){
                return node.querySelectorAll('.' + searchClass);
            }
            els = node.getElementsByTagName(tag);
            elsLen = els.length;
            pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
            for (i = 0, j = 0; i < elsLen; i++) {
                if (pattern.test(els[i].className)) {
                    classElements[j] = els[i];
                    j++;
                }
            }
            return classElements;
        },
        _addEvent : function (o,type,fn) {
            o.attachEvent ? o.attachEvent('on'+type,fn) : o.addEventListener(type,fn,false);
        },
        _clipStr: function(str, a, b) {
            var s = str.replace(/([^\x00-\xff])/g, "\x00$1");
            return (s.length < b) ? str : (s.substring(a, b - 3).replace(/\x00/g, '') + '...');
        },
        _extends : function (destination, source) {
            for(property in source) {
                destination[property] = source[property];
            }
            return destination;
        },
        _initConf : function (conf) {
            var that = this;
            var linesState = [];
            this.conf = this._extends({
                element : 'barrages',
                cover : false,
                // layout : 'equality',
                lines : 8,
                maxList : 200,
                maxTxtLen : 60,
                aniSpeed : 1
            }, conf);
            for(var i = 0; i < this.conf.lines; i ++){
                linesState.push(true);
            }
            this.states = {
                timeStart : null,
                nextLine : 0,
                wrapSize : null,
                taskList : [],
                lines : that.conf.lines,
                linesState : linesState,
                cleared : false
            };

        },
        _initDoms : function () {
            var c = this.conf, s = this.states,
                element, wrap, mask, lines, tempLine,
                offWth;
            element = typeof c.element == 'string' ? this._id(c.element) : c.element;
            element.style.position = 'relative';
            element.innerHTML += '\
                <div class="brg_wrap">\
                    <div class="brg_mask"></div>\
                </div>';
            wrap = this._class('brg_wrap', element, 'div')[0];
            mask = this._class('brg_mask', wrap, 'div')[0];
            if(!c.cover){
                mask.style.display = 'none';
            }
            if(c.top){
                wrap.style.top = c.top + 'px';
            }
            if(c.left){
                wrap.style.left = c.left + 'px';
            }
            lines = [];
            for(var i = 0; i < s.lines; i ++){
                tempLine = document.createElement('div');
                tempLine.className = 'brg_line brg_line' + i;
                lines.push(tempLine);
                wrap.appendChild(tempLine);
            }
            this.doms = {
                element : element,
                wrap : wrap,
                mask : mask,
                lines : lines
            };
            s.wrapSize = element.offsetWidth;
        },
        // 处理弹幕文字
        _filterTxt : function (txt) {
            txt = txt
                .replace(/(^\s*)|(\s*$)/g, '')
                .replace(/<[^>]+>/g, '');
            txt = this._clipStr(txt, 0, this.conf.maxTxtLen);
            return txt;
        },
        // 获取弹幕宽度
        _getItemSize : function (txt) {
            var d = this.doms;
            var item = document.createElement('span');
            var ret;
            item.className = 'brg_item';
            item.style.visibility = 'hidden';
            item.innerHTML = txt;
            d.wrap.appendChild(item);
            ret = item.offsetWidth;
            d.wrap.removeChild(item);
            return ret;
        },
        // 从积压数据的数组中立即吐出一条并显示
        _showAItemInLine : function (lineIdx) {
            var that = this;
            var c = this.conf, d = this.doms, s = this.states;
            var curLen = s.taskList.length;
            var itemObj, item, itemWth, itemTxt;
            if(!curLen){
                return;
            }
            itemObj = s.taskList.pop();
            itemTxt = this._filterTxt(itemObj.txt);
            if(itemTxt.length == 0){
                return;
            }
            item = document.createElement('span');
            item.className = 'brg_item ' + (Math.random() < 0.5 ? 'brg_item_skin0' : 'brg_item_skin1');
            item.innerHTML = itemTxt;
            itemWth = this._getItemSize(itemTxt);
            item.style.right = - itemWth + 'px';
            // 开始动画
            this._animateItem(item, itemWth, lineIdx);
        },
        // 弹幕动画
        _animateItem : function (item, itemWth, lineIdx) {
            var that = this;
            var c = this.conf, d = this.doms, s = this.states;
            var curPosX = - itemWth;
            var pathLen = s.wrapSize + itemWth;
            var aniSpeed = c.aniSpeed, itv_ani, thisItemBlank = false;
            this._setLineState(lineIdx, false);
            d.lines[lineIdx].appendChild(item);
            itv_ani = setInterval(function () {
                var toPos = curPosX + aniSpeed;
                if(s.cleared){
                    clearInterval(itv_ani);
                    itv_ani = null;
                    item.parentNode.removeChild(item);
                    return;
                }
                // 已走完全程
                if(toPos > s.wrapSize){
                    clearInterval(itv_ani);
                    itv_ani = null;
                    item.parentNode.removeChild(item);
                    // that._setLineState(lineIdx, true);
                    return;
                }
                // 
                if(toPos > 20 && !s.linesState[lineIdx] && !thisItemBlank){
                    that._setLineState(lineIdx, true);
                    thisItemBlank = true;
                }
                curPosX = toPos;
                item.style.right = toPos + 'px';
            }, 12);
        },
        // 置某一条通道为畅通/阻塞状态
        _setLineState : function (lineIdx, isBlank) {
            var s = this.states;
            s.linesState[lineIdx] = !!isBlank;
            if(isBlank){
                this._checkPopItem();
            }
        },
        // 检查当前有无畅通的通道，如有，则立即从积压数据的数组中立即吐出一条并显示
        _checkPopItem : function () {
            var s = this.states;
            var addToLineIdx = null;
            for(var i = 0; i < s.lines; i ++){
                if(s.linesState[i]){
                    addToLineIdx = i;
                    break;
                }
            }
            if(addToLineIdx !== null){
                this._showAItemInLine(addToLineIdx);
            }
        },
        // 添加一条
        add : function (msgList) {
            var c = this.conf, s = this.states;
            if(s.cleared){
                return;
            }
            s.taskList = s.taskList.concat(msgList);
            // 积压数据的数组长度超出最大限定值则丢弃数据，保证内存
            if(s.taskList.length > c.maxList){
                s.taskList = s.taskList.splice(s.taskList.length - c.maxList);
            }
            this._checkPopItem();
        },
        // 清空积压数据并暂停弹幕
        clear : function () {
            var s = this.states;
            s.cleared = true;
            s.taskList = [];
            for(var i = 0; i < s.lines; i ++){
                this._setLineState(i, true);
            }
        },
        // 重新开始播放弹幕
        restart : function () {
            var s = this.states;
            s.cleared = false;
        },
        // 调整弹幕主容器宽度
        resize : function (wth) {
            var d = this.doms, s = this.states;
            if(isNaN(wth) || wth <= 0){
                return;
            }
            d.wrap.style.width = wth + 'px';
            s.wrapSize = wth;
        }
    };
    return init;
}();